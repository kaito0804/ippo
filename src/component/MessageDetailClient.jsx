"use client";

//react/next.js用ライブラリ
import { useEffect, useState, useRef } from "react";
import Link from 'next/link'

//cloudinary関連
import { uploadToCloudinary } from "@/utils/cloudinary/cloudinary";

//データベース関連
import { supabase } from "@/utils/supabase/supabaseClient";
import { useUserContext } from '@/utils/userContext';

import {startDayJP, isGroupFinished} from '@/utils/function/function';



export default function MessageDetailClient({ groupId, anotherUserId }) {
	const pageSize = 30; // 1ページあたりのメッセージ取得件数

	//URLのクエリパラメータからgroupIdを取得
	const isGroupChat   = !!groupId;
	const isDirectChat  = !!anotherUserId && !groupId; //両方指定された場合は group 優先

	//ユーザー関連情報（コンテキストから取得）
	const { userId, isHost, nowStatus, setNowStatus } = useUserContext();

	//メッセージデータ関連の状態管理
	const [messages, setMessages]       = useState([]);    // 表示中のメッセージ一覧
	const [newMsg, setNewMsg]           = useState("");    // 新規メッセージ入力内容
	const [page, setPage]               = useState(0);     // ページ番号（何ページ目を取得しているか）
	const [hasMore, setHasMore]         = useState(true);  // 追加で取得可能かどうか（スクロール無限取得用）
	const [loadingMore, setLoadingMore] = useState(false); // 追加読み込み中フラグ
	const [isScrolling, setIsScrolling] = useState(false); // スクロール検知のON/OFF管理

	//個人メッセージ相手の情報
	const [anotherUser, setAnotherUser] = useState(null);

	//グループ情報
	const [group, setGroup]                 = useState(null); // 現在のグループ情報（名前やメンバー数など）
	const [groupFinished, setGroupFinished] = useState(false); // グループチャットの終了判定
	const [groupFinishedDialog, setGroupFinishedDialog] = useState(true);

	//選択画像・入力関連
	const [selectedImage, setSelectedImage] = useState(null);  // 選択中の画像（スタンプや写真送信用）
	const [isMultiLine, setIsMultiLine]     = useState(false); // テキスト入力の複数行切替フラグ
	const textareaRef                       = useRef(null);    // メッセージ入力用textareaのDOM参照

	//スクロール領域の参照（メッセージ一覧のスクロールコンテナ）
	const scrollContainerRef = useRef(null);

	//メッセージ一覧一番下の参照（新着時スクロール用）
	const bottomRef = useRef(null);

	//プロフィールキャッシュ（ユーザーIDごとのプロフィール情報を保持）
	const profilesCacheRef = useRef({});

	//フェッチ中判定用（多重fetchを防ぐ）
	const isFetchingRef = useRef(false);



/*----------------------------------------------------------------------------------
▼ 以下useEffect ▼
-----------------------------------------------------------------------------------*/

	/*========================

	初回メッセージ取得

	=========================*/
	useEffect(() => {
		const fetchInitial = async () => {
			if (isGroupChat) {
				// グループチャットの初期化
				const { data: groupData, error: groupError } = await supabase
					.from("groups")
					.select("*")
					.eq("id", groupId)
					.single();

				const { count } = await supabase
					.from("group_members")
					.select("user_id", { count: "exact", head: true })
					.eq("group_id", groupId);

				if (groupError) throw groupError;
				 	const groupInfo = { ...groupData, member_count: count };
					setGroup(groupInfo);
					setGroupFinished(isGroupFinished(groupInfo.start_date));
			}

			if (isDirectChat) {
				// 個人チャットの初期化
				const { data: userProfile, error } = await supabase
					.from("user_profiles")
					.select("*")
					.eq("id", anotherUserId)
					.single();

				if (error) {
					console.error("ユーザー取得エラー:", error);
					return;
				}
				setAnotherUser({...userProfile});
			}
			
			await fetchOlderMessages(0);
		};

		if (groupId || anotherUserId) fetchInitial();
	}, [groupId, anotherUserId, userId]);


	/*============================

	メッセージをページングごとに取得

	============================*/
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (container && isScrolling) {
			container.addEventListener("scroll", messageScrollTop);
			return () => container.removeEventListener("scroll", messageScrollTop);
		}
	}, [page, loadingMore, hasMore, isScrolling]); // ← page 入れておくことでリセットを防ぐ



	/*============================

	リアルタイムメッセージ購読

	============================*/
	useEffect(() => {
		const subscription = supabase
			.channel("custom:messages")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "messages" },
				async (payload) => {
					const newMessage = payload.new;

					// 条件に応じてフィルター
					if (isGroupChat && newMessage.group_id !== groupId) return;
					if (isDirectChat) {
						const isDirect = [newMessage.user_id, newMessage.target_user_id].includes(userId) &&
							[newMessage.user_id, newMessage.target_user_id].includes(anotherUserId);
						if (!isDirect) return;
					}

					// 重複チェック（強制メッセージUI更新との競合を防ぐ）
					setMessages((prev) => {
						const exists = prev.some(msg => 
							msg.id === newMessage.id || 
							(msg.isTemporary && msg.user_id === newMessage.user_id && msg.content === newMessage.content)
						);
						
						if (exists) {
							// 一時的なメッセージを実際のメッセージに置き換え
							return prev.map(msg => 
								msg.isTemporary && msg.user_id === newMessage.user_id && msg.content === newMessage.content
									? { ...newMessage, user_profiles: msg.user_profiles }
									: msg
							);
						}

						// 新しいメッセージを追加
						const cachedProfile = profilesCacheRef.current[newMessage.user_id];
						if (cachedProfile) {
							return [...prev, { ...newMessage, user_profiles: cachedProfile }];
						} else {
							// プロフィール取得は非同期で行い、後で更新
							supabase
								.from("user_profiles")
								.select("id, display_name, icon_path, is_host")
								.eq("id", newMessage.user_id)
								.single()
								.then(({ data: profile }) => {
									if (profile) {
										profilesCacheRef.current[profile.id] = profile;
										setMessages((current) => 
											current.map(msg => 
												msg.id === newMessage.id 
													? { ...msg, user_profiles: profile }
													: msg
											)
										);
									}
								});
							
							return [...prev, { ...newMessage, user_profiles: null }];
						}
					});
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(subscription);
		};
	}, [userId, groupId, anotherUserId, isGroupChat, isDirectChat]);



	/*============================

	最終読み込み日時更新

	============================*/
	useEffect(() => {
		const updateLastRead = async () => {
			if (!groupId || !userId) return;

			await supabase
			.from("group_members")
			.update({ last_read_at: new Date().toISOString() })
			.eq("group_id", groupId)
			.eq("user_id", userId);
		};

		updateLastRead();
	}, []);


	/*========================

	最新メッセージへスクロール

	=========================*/
	useEffect(() => {
		if (bottomRef.current && !isScrolling) {
			bottomRef.current.scrollIntoView({ behavior: "smooth" });
			setTimeout(() => {
				setIsScrolling(true);
			}, 1000);
		}
	}, [messages]);
	


/*----------------------------------------------------------------------------------
▼ 以下関数 ▼
-----------------------------------------------------------------------------------*/

	/*============================

	メッセージをページングごとに取得
	
	============================-*/
	const fetchOlderMessages = async (pageNumber = 0) => {
		if (isFetchingRef.current || !userId) return;
		isFetchingRef.current = true;
		try {
			setLoadingMore(true);

			const from = pageNumber * pageSize;
			const to   = from + pageSize - 1;

			let query = supabase
			.from("messages")
			.select(
				`*,
				user_profiles:user_id (
					id,
					display_name,
					icon_path,
					is_host
				)`
			)
			.order("created_at", { ascending: false })
			.range(from, to);

			if (isGroupChat) {
				query = query.eq("group_id", groupId);
			} else if (isDirectChat) {
				query = query.or(
					`and(user_id.eq.${userId},target_user_id.eq.${anotherUserId}),and(user_id.eq.${anotherUserId},target_user_id.eq.${userId})`
				);
			}

			const { data: messageData, error } = await query;

			if (error) throw error;

			const reversedMessages = messageData ? [...messageData].reverse() : [];
			console.log(`取得したメッセージ（page ${pageNumber}）`, reversedMessages);

			if (messageData.length < pageSize) setHasMore(false);

			// プロフィールキャッシュ更新
			const newCache = { ...profilesCacheRef.current };
				messageData.forEach((msg) => {
				if (msg.user_profiles) {
					newCache[msg.user_profiles.id] = msg.user_profiles;
				}
			});
			profilesCacheRef.current = newCache;

			if (pageNumber === 0) {
				// 初回はそのままセット
				setMessages(reversedMessages);
			} else {
				// 追加は既存の前に（上に）古いメッセージを追加
				setMessages((prev) => [...reversedMessages, ...prev]);
			}

			setPage((prev) => prev + 1);
		} catch (e) {
			console.error("メッセージ取得失敗:", e.message);
		} finally {
			setLoadingMore(false);
			isFetchingRef.current = false;
		}
	};


	/*========================================

	メッセージをスクロールで古いメッセージを取得
	
	=========================================*/
	const messageScrollTop = () => {
		if (!scrollContainerRef.current) return;
		if (loadingMore || !hasMore) return; //読み込み中や終了済みなら無視

		const container = scrollContainerRef.current;
		if (container.scrollTop < 150) {
			fetchOlderMessages(page);
		}
	};


	/*==============

	画像アップロード
	
	===============*/
	const imageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedImage(file);
		}
	};



	/*==============

	メッセージ送信
	
	===============*/
	const sendMessage = async () => {
		if (!newMsg && !selectedImage) {
			alert("メッセージを入力してください");
			return;
		}

		// 強制メッセージUI更新用の一時的なメッセージ
		const tempId = `temp_${Date.now()}`;
		const tempMessage = {
			id: tempId,
			content: newMsg,
			user_id: userId,
			created_at: new Date().toISOString(),
			image_url: selectedImage ? URL.createObjectURL(selectedImage) : null,
			user_profiles: profilesCacheRef.current[userId] || {
				id: userId,
				display_name: "あなた",
				icon_path: null
			},
			...(isGroupChat ? { group_id: groupId } : { target_user_id: anotherUserId }),
			isTemporary: true // 一時的なメッセージの印
		};

		// 即座にUIを更新
		setMessages((prev) => [...prev, tempMessage]);
		setIsScrolling(false); 

		// 画像アップロード
		let imageUrl = null;
		if (selectedImage) {
			try {
				imageUrl = await uploadToCloudinary(selectedImage);
			} catch (error) {
				console.error("画像アップロードエラー:", error);
				// 失敗した場合は一時的なメッセージを削除
				setMessages((prev) => prev.filter(msg => msg.id !== tempId));
				return;
			}
		}

		const insertPayload = isGroupChat
			? {
				content: newMsg,
				user_id: userId,
				group_id: groupId,        
				image_url: imageUrl,
			}
			: {
				content: newMsg,
				user_id: userId,
				target_user_id: anotherUserId,
				image_url: imageUrl,
			};

		// 送信
		const { data, error } = await supabase.from("messages").insert([insertPayload]).select();

		if (error) {
			console.error("送信エラー:", error.message);
			// 失敗した場合は一時的なメッセージを削除
			setMessages((prev) => prev.filter(msg => msg.id !== tempId));
			return;
		}

		// 成功した場合は一時的なメッセージを実際のメッセージに置き換え
		if (data && data[0]) {
			setMessages((prev) => 
				prev.map(msg => 
					msg.id === tempId 
						? { ...data[0], user_profiles: tempMessage.user_profiles, image_url: imageUrl }
						: msg
				)
			);
		}

		// フォームリセット
		setNewMsg("");
		setSelectedImage(null);
		if (textareaRef.current) textareaRef.current.style.height = "auto";
		setIsMultiLine(false);

		// グループチャットなら groups テーブルに最終送信時刻を保存
		if (isGroupChat) {
			await supabase
				.from("groups")
				.update({ last_message_at: new Date().toISOString() })
				.eq("id", groupId);
		}

		// 個人チャットなら user_chats テーブルに履歴を更新（送信者視点）
		if (isDirectChat && data && data[0]) {
			const message = data[0];

			const updates = [
				// 自分側のチャットリスト用
				{
					user_id: userId,
					partner_id: anotherUserId,
					last_message_at: message.created_at,
					last_message: message.content || "[画像]",
					unread_count: 0,
					last_sender_flag: 0
				},
				// 相手側のチャットリスト用（未読件数+1）
				{
					user_id: anotherUserId,
					partner_id: userId,
					last_message_at: message.created_at,
					last_message: message.content || "[画像]",
					unread_count: 1,
					last_sender_flag: 1
				}
			];

			// UPSERT（既にある場合は更新）
			for (const update of updates) {
				await supabase
					.from("user_chats")
					.upsert(update, { onConflict: ['user_id', 'partner_id'] });
			}
		}

	};



	/*===================

	メッセージ送信時刻取得

	====================*/
	const sendTime = (isoDateStr) => {
		const date    = new Date(isoDateStr);
		const hours   = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	};


	/*========================

	テキストエリアの高さ自動調整

	=========================*/
	const textAreaManager = (e) => {
		const textarea = e.target;
		textarea.style.height = "auto"; // 高さリセット
		textarea.style.height = `${textarea.scrollHeight}px`; // 内容に応じた高さに

		setIsMultiLine(textarea.scrollHeight > 40);
	};



	/*========================

	日付取得

	=========================*/
	function startDay(dateStr) {
		const date      = new Date(dateStr);
		const days      = ['日', '月', '火', '水', '木', '金', '土'];
		const year      = date.getFullYear();
		const month     = date.getMonth() + 1; // 月は0始まり
		const day       = date.getDate().toString().padStart(2, '0');
		const dayOfWeek = days[date.getDay()];

		return `${year}/${month}/${day}(${dayOfWeek})`;
	}

	return (
		<div>

			{isGroupChat && group && groupFinished && groupFinishedDialog && (
				<div className="fixed flex justify-center items-center bg-[#606060cc] z-[9999] w-[340px] py-[50px] rounded-[7px] top-[50%] left-[calc(50%-170px)] transform translate-y-[-50%] text-[#fff] text-center">
					<p className="text-[14px] font-bold">こちらのイベントは<br />終了しております</p>
					<div onClick={() => setGroupFinishedDialog(false)} 
						className="absolute top-[16px] right-[16px] w-[18px] h-[18px] bg-cover bg-center bg-no-repeat" 
						style={{backgroundImage: `url('https://res.cloudinary.com/dnehmdy45/image/upload/v1755226933/Icon_close_white_wzvaag.svg')`}}></div>
				</div>
			)}

			<div className="fixed top-[0] flex justify-left items-center w-[100%] py-[10px] px-[5px] content-bg-color border-b border-[#e0e0e0] z-[100]">
				<Link href="/message_box" className="w-[28px] h-[28px] mr-[10px] bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('https://res.cloudinary.com/dnehmdy45/image/upload/v1751266821/nav-arrow-left_orpd2v.svg')`}}></Link>
				{isGroupChat && group ? (
					<div className="flex items-center">
						<div className="w-[32px] h-[32px] mr-[10px] bg-cover bg-center bg-no-repeat rounded-full" style={{ backgroundImage: `url(${group.image_url})` }}></div>
						<div className="flex flex-col">
							<div className="flex items-center justify-start">
								<p className="flex items-center text-[14px] font-bold">{group.name}</p>
							</div>
							<p className="text-[11px] font-bold"><span>{startDay(group.start_date)} {group.start_time.slice(0, 5)}  {group.venue}</span></p>
						</div>
					</div>
				) : (isDirectChat && anotherUser) ? (
					// 個人チャットのヘッダー
					<div className="flex items-center">
						<Link href={`/user_page/${anotherUser.id}`} className="w-[32px] h-[32px] mr-[10px] bg-cover bg-center bg-no-repeat rounded-full border border-[#e0e0e0]" style={{ backgroundImage: `url(${anotherUser.icon_path})` }}></Link>
						<div className="flex flex-col">
							<p className="text-[13px] font-bold">{anotherUser.display_name ? anotherUser.display_name : '匿名'}</p>
						</div>
					</div>
				) : (
					// データ読み込み中など
					<p>チャット情報を読み込み中...</p>
				)}
			</div>

			<div ref={scrollContainerRef} className="w-[100%] h-[calc(var(--vh)_*100-50px)] pt-[60px] px-[16px] overflow-y-scroll">
				<ul className="w-[100%] py-[20px]">
					{/*テンプレートメッセージ*/}
					{isGroupChat && group && (
						<div className="flex items-start w-[100%] whitespace-pre-wrap">
							<div
								className="w-[30px] h-[30px] min-w-[30px] mr-[7px] bg-[#fff] bg-size-[54px] bg-center bg-no-repeat rounded-full border border-[#e0e0e0]"
								style={{backgroundImage: `url(https://res.cloudinary.com/dnehmdy45/image/upload/v1753231432/IPPO_graphics-camelhead_lwn5ui.svg)`}}
							></div>
							<div className="w-[100%]">
								<div className="text-[10px] text-gray-500 font-bold mb-[1px]">IPPO運営</div>
								<div className={`flex items-center my-1 text-sm`}>
									<div className={`message-text others`}>
										<p className="text-left py-[10px]">
											<span className="absolute right-[-32px] bottom-[0px] text-[10px] text-gray-500"></span>
											＼こんにちは🌿IPPOへようこそ／<br/>
											<br/>
											このチャットは、<span className="font-bold">{startDayJP(group.start_date)}</span> 開催の<span className="font-bold">【{group.name}】</span>にご参加くださる皆さんのためのゆるやかな交流スペースです☺️<br/>
											<br/>
											入室した方から簡単な自己紹介をお願いします！<br/>
											<br/>
											【自己紹介のヒント】<br/>
											・ニックネーム（呼ばれたい名前）<br/>
											・趣味、好きなこと<br/>
											・ひとこと（楽しみにしてること、最近のマイブームなど）<br/>
											<br/>
											✅ご確認事項
											プロフィールに集合情報を掲示していますので、一度目を通していただけたら嬉しいです！
										</p>
									</div>
								</div>
							</div>
						</div>
					)}


					{(() => {
						const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
						const jpDate   = (isoDateStr) => {
							const date = new Date(isoDateStr);
							return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${weekdays[date.getDay()]})`;
						};

						// 各日付で最初のメッセージだけ日付表示するために日付トラッキング	
						let lastDateStr = null;
						return messages.map((msg) => {
							const isOwnMessage      = msg.user_id === userId;
							const msgDateStr        = msg.created_at.split("T")[0]; // "2025-07-01"など	
							const showDateSeparator = msgDateStr !== lastDateStr;	
							if (showDateSeparator) {	
								lastDateStr = msgDateStr;	
							}

							return (
								<li key={msg.id} className="relative flex flex-col mb-[20px]">
									{showDateSeparator && (
										<div className="flex items-center justify-center my-2">
											<p className="inline-block mx-auto py-[2px] px-[12px] bg-[#a6a6a6] text-[#fff] rounded-[100px] text-[11px]">
											{jpDate(msgDateStr)}
											</p>
										</div>
									)}

									{/* 自分のメッセージ*/}
									{isOwnMessage && (
										<div className={`flex items-center my-1 text-sm whitespace-pre-wrap`}>
											
											<div className={`message-text mine`}>
												{msg.image_url && (
													<div className="flex items-center justify-center">
														<div className="w-[120px] h-[120px] m-[5px] mt-[10px] bg-cover bg-center bg-no-repeat rounded-lg" style={{ backgroundImage: `url(${msg.image_url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto/')})` }}/>
													</div>
													)}
												<p className="relative text-left p-[5px]">
													<span className="absolute left-[-45px] bottom-[0px] text-[10px] text-gray-500">{sendTime(msg.created_at)}</span>
													{msg.content}
												</p>
											</div>
										</div>
									)}

									{/* 他人のメッセージ*/}
									{!isOwnMessage && (
										<div className="flex items-start w-[100%] whitespace-pre-wrap">
											<Link
												href={`/user_page/${msg.user_id}`}
												className="relative w-[30px] h-[30px] min-w-[30px] mr-[7px] bg-cover bg-center bg-no-repeat rounded-full border border-[#e0e0e0]"
												style={{
													backgroundImage: `url(${
													msg.user_profiles?.icon_path
														? msg.user_profiles.icon_path.replace('/upload/', '/upload/w_40,h_40,c_fill,q_auto/')
														: 'https://res.cloudinary.com/dnehmdy45/image/upload/v1750917949/user-middle-gray_z3eql3.svg'
													})`,
											}}
											>
											
											</Link>
											<div className="w-[100%]">
												<div className="text-[10px] text-gray-500 font-bold mb-[1px]">
													{msg.user_profiles?.display_name || "匿名"}
													{msg.user_profiles?.is_host == true && (
														<p className="inline-flex items-center justify-center w-[34px] py-[1px] ml-[3px] rounded-[100px] text-[9px] text-[#fff] bg-[#ff9a49]">運営</p>
													)}
												</div>
												<div className={`flex items-center my-1 text-sm`}>
													<div className={`message-text others`}>
														{msg.image_url && (
															<div className="flex items-center justify-center">
															<div
																className="w-[120px] h-[120px] m-[5px] mt-[10px] bg-cover bg-center bg-no-repeat rounded-lg"
																style={{
																	backgroundImage: `url(${msg.image_url.replace(
																		'/upload/',
																		'/upload/w_200,h_200,c_fill,q_auto/'
																	)})`,
																}}
															/>
															</div>
														)}
														<p className="text-left p-[5px]">
															<span className="absolute right-[-32px] bottom-[0px] text-[10px] text-gray-500">{sendTime(msg.created_at)}</span>
															{msg.content}
														</p>
													</div>
												</div>
											</div>
										</div>
									)}
									
								</li>
							);
						});
					})()}
				</ul>

				<div ref={bottomRef} />

				{!groupFinished ? (
					<div
					className={`fixed bottom-[0] left-[0] flex items-center w-[100%] pt-[10px] pb-[15px]  bg-[#fff] z-[100] ${
						isGroupChat ? 'justify-between px-[15px]' : 'justify-center gap-[20px]'
					}`}
					>						
						{isGroupChat && (
							<div>
							{selectedImage && (
								<div className="img-preview-box">
									<img src={URL.createObjectURL(selectedImage)} alt="プレビュー" className="w-[100px] rounded-lg"/>
								</div>
							)}
							<label className="block w-[22px] h-[22px] bg-cover bg-center bg-no-repeat cursor-pointer"
								style={{ backgroundImage: `url('https://res.cloudinary.com/dnehmdy45/image/upload/v1751332855/camera_igrw7c.svg')` }}
							>
								<input type="file" accept="image/*" onChange={imageChange} className="hidden"/>
							</label>
							</div>
						)}
											
						
						<textarea
							ref  ={textareaRef}
							value={newMsg}
							onChange={(e) => setNewMsg(e.target.value)}
							onInput={textAreaManager}
							rows={1}
							placeholder="メッセージを入力"
							className={`w-[80%] px-[10px] py-[6px] text-[13px] bg-[#f5f5f5] resize-none overflow-hidden leading-[1.4] transition-all duration-200 ${
								isMultiLine ? "rounded-lg" : "rounded-[100px]"
							}`}
						/>	

						<div onClick={sendMessage} className="w-[22px] h-[22px] bg-cover bg-center bg-no-repeat" style={{backgroundImage : `url('https://res.cloudinary.com/dnehmdy45/image/upload/v1751332483/send_nfcvzx.svg')`}}></div>
					</div>
				) : (
					<div className="fixed bottom-[0] left-[0] flex justify-center items-center w-[100%] pt-[10px] pb-[15px] px-[15px] bg-[#fff] z-[100]">
						<p className="text-[12px] text-gray-500">イベントは終了しました</p>
					</div>
				)}
				

			</div>

		</div>
	);
}
