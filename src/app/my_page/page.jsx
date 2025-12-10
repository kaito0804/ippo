"use client";

//react/next.js用ライブラリ
import { useEffect, useState, useRef } from "react";
import Link from 'next/link'

//cloudinary関連
import { uploadToCloudinary } from "@/utils/cloudinary/cloudinary";

//データベース関連
import { supabase } from "@/utils/supabase/supabaseClient";

//コンポーネント
import { useUserContext } from '@/utils/userContext';
import { getLabelById } from '@/utils/function/function';
import Header  from "@/component/Header";
import PrfFriendList from "@/component/PrfFriendList";
import PrfJoinGroup from "@/component/PrfJoinGroup";

export default function UserPage() {

	const { userProfile, setUserProfile }           = useUserContext();
	const userId                                    = userProfile?.id;
	const [groupMemberProfiles, setGroupMemberProfiles] = useState([]);
	const [joinGroup, setJoinGroup]                 = useState([]);
	const [joinedGroup, setJoinedGroup]             = useState([]);
	const [offset, setOffset]                       = useState(0);
	const [hasMore, setHasMore]                     = useState(true);
	const [nameChangeTrigger, setNameChangeTrigger] = useState(false);
	const [editName, setEditName]                   = useState(""); 
	const [isEditing, setIsEditing]                 = useState(false);
	const [isEditingMail, setIsEditingMail]         = useState(false);
  	const [commentText, setCommentText]             = useState(userProfile?.comment || "");
	const textareaRef                               = useRef(null);
	const [mail, setMail]                           = useState(userProfile?.email || "");
	const [emailReceive, setEmailReceive]           = useState(userProfile?.mail_receive_flg ?? true);
	const [friendList, setFriendList]               = useState();
	const [loading, setLoading]                     = useState(true);
	const limit = 10;

	
	useEffect(() => {
		if (userProfile) {
			setLoading(false); 
		}
	}, [userProfile]);

	

	/*===================================

	以前一緒になったことのあるユーザーを取得

	====================================*/
	const fetchNextUser = async (reset = false) => {
		if (!userId || !hasMore) return;

		const { data, error } = await supabase.rpc("get_finished_group_users", {
			p_user_id: userId,
			p_limit: limit,
			p_offset: reset ? 0 : offset
		});

		if (!error) {
			if (data.length === 0) {
			setHasMore(false);
			return;
			}

			setGroupMemberProfiles(prev => reset ? data : [...prev, ...data]);
			setOffset(prev => reset ? data.length : prev + data.length);

			if (data.length < limit) setHasMore(false);
		} else {
			setHasMore(false);
		}
	};

	useEffect(() => {
		fetchNextUser(true); // 初回はリセットして取得
	}, [userId]);



	/*======================================

	参加済みかつまだ終了していないグループを取得

	========================================*/
	const fetchOngoingGroups = async () => {
		if (!userId) return;

		const { data, error } = await supabase
		.rpc("get_my_ongoing_groups", { user_id: userId });

		if (error) {
			console.error("RPC取得エラー1:", error);
			return;
		}

		setJoinGroup(data || []);
		console.log("参加済みかつ未終了グループ:", data);
	};
	


	/*===================================

	参加済みかつ既に終了しているグループを取得

	====================================*/
	const fetchFinishedGroups = async () => {
		if (!userId) return;
		const { data, error } = await supabase
			.rpc("get_my_finished_groups", { user_id: userId });

		if (error) {
			console.error("RPC取得エラー2:", error);
			return;
		}

		setJoinedGroup(data || []);
		console.log("参加済みかつ終了済みグループ:", data);
	};



	//初回ロード時にグループ情報を取得
	useEffect(() => {
		fetchOngoingGroups();
		fetchFinishedGroups();
	}, [userId]);



	/*========================================

	名前変更処理

	=========================================*/
	useEffect(() => {
		if ((isEditing  || isEditingMail) && textareaRef.current) {
			const el = textareaRef.current;
			el.focus();
			el.setSelectionRange(el.value.length, el.value.length); // カーソルを末尾に
		}
	}, [isEditing, isEditingMail]);



	/*========================================

	アイコン変更処理

	=========================================*/
	const iconChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			// Cloudinaryへアップロード
			const imageUrl = await uploadToCloudinary(file);

			// Supabaseのプロフィールに保存
			const { error: updateError } = await supabase
			.from("user_profiles")
			.update({ icon_path: imageUrl })
			.eq("id", userId);

			if (updateError) {
				alert("プロフィール更新に失敗しました");
				console.error(updateError);
				return;
			}

			// 表示用profile state更新
			setUserProfile((prev) => ({ ...prev, icon_path: imageUrl }));
		} catch (error) {
			console.error("エラー:", error);
		}
	};



	/*========================================

	名前入力変更時

	=========================================*/
	const nameChange = (e) => {
		setEditName(e.target.value);
	};



	/*========================================

	名前保存処理（Enterキー or フォーカス外れ時）

	=========================================*/
	const saveName = async () => {
		if (!editName || editName === userProfile.display_name) {
			setNameChangeTrigger(false);
			return;
		}

		const { error } = await supabase
			.from("user_profiles")
			.update({ display_name: editName })
			.eq("id", userId);

		if (error) {
			alert("名前の更新に失敗しました");
			console.error(error);
			return;
		}

		// 表示用に更新
		setUserProfile((prev) => ({ ...prev, display_name: editName }));
		setNameChangeTrigger(false);
	};



	/*========================

	自己紹介文の変更

	=========================*/
	const setCommentChange = () => {
		setCommentText(userProfile?.comment || ""); // 保存されたコメントを初期値に
		setIsEditing(true); 
	}

	const changeComment = async () => {
		try {
		// Supabaseに保存
		const { error } = await supabase
			.from("user_profiles")
			.update({ comment: commentText })
			.eq("id", userId);

		if (error) {
			console.error("自己紹介の更新に失敗:", error.message);
			alert("自己紹介の保存に失敗しました");
			return;
		}

		// ステート更新して編集モード解除
		setUserProfile((prev) => ({ ...prev, comment: commentText }));
		setIsEditing(false);
		} catch (err) {
		console.error("保存中エラー:", err);
		}
	};



	/*========================

	メール変更

	=========================*/
	const setMailChange = () => {
		setMail(userProfile?.email || "");
		setIsEditingMail(true); 
	}

	const changeMail = async () => {
			try {
		// Supabaseに保存
		const { error } = await supabase
			.from("user_profiles")
			.update({ email: mail })
			.eq("id", userId);

		if (error) {
			console.error("mailの更新に失敗:", error.message);
			alert("メールアドレスの保存に失敗しました");
			return;
		}

		// ステート更新して編集モード解除
		setUserProfile((prev) => ({ ...prev, email: mail }));
		setIsEditingMail(false);
		} catch (err) {
			console.error("保存中エラー:", err);
		}
	};



	/*========================

	メール受信設定の変更

	=========================*/
	const changeMailReceive = async () => {
		const newValue = !emailReceive;
		setEmailReceive(newValue);

		try {
			// Supabaseに保存
			const { error } = await supabase
			.from("user_profiles")
			.update({ mail_receive_flg: newValue })
			.eq("id", userId);

			if (error) {
			console.error("mail受信設定更新に失敗:", error.message);
			alert("mail受信設定更新に失敗しました");
			return;
			}

			setUserProfile((prev) => ({ ...prev, mail_receive_flg: newValue }));
		} catch (err) {
			console.error("保存中エラー:", err);
		}
	};


	return (
		<div className="my-page content-bg-color">
			<Header/>

			<div style={{ display: loading ? 'flex' : 'none' }} className="fixed inset-0 bg-white bg-opacity-80 z-50 justify-center items-center">
				<p className="text-xl text-[#ff7a00] font-bold animate-pulse">読み込み中です...</p>
			</div>
			
			{userProfile && (
				<div className="header-adjust h-adjust py-[30px] overflow-y-scroll">
					<div className="flex flex-col items-center justify-center px-[20px]">
						<div className="user-icon-box">
							<div className="user-icon" style={{ backgroundImage: `url('${userProfile?.icon_path || 'https://res.cloudinary.com/dnehmdy45/image/upload/v1750906560/user-gray_jprhj3.svg'}')` }}></div>
							<label className="change-icon">
								<input type="file" accept="image/*" onChange={iconChange} className="hidden"/>
							</label>
						</div>
						{nameChangeTrigger ? (
							<input
								type="text"
								value={editName}
								onChange={nameChange}
								onBlur={saveName} // フォーカス外れたら保存
								onKeyDown={(e) => e.key === "Enter" && saveName()}
								className="py-[2px] px-[5px] text-[14px] font-bold mt-[10px] rounded-[5px] border border-[#e1e1e1]"
								autoFocus
							/>
							) : (
							<p
								onClick={() => {
								setEditName(userProfile.display_name || ""); // 編集用にセット
								setNameChangeTrigger(true);
								}}
								className="name-text mt-[10px] py-[3px]"
							>
								{userProfile.display_name || "匿名"}
							</p>
						)}

						<div className="flex flex-col justify-center items-center w-[100%] mt-[20px] gap-[5px]">
							<p className="text-[13px]">年代 : {getLabelById(userProfile?.age, 'age')}</p>
							<p className="text-[13px]">趣味 : {getLabelById(userProfile?.hobby, 'hobby')}</p>
						</div>

						
						<div className="flex flex-col justify-center items-center w-[100%] mt-[14px]">
							<p className="my-self-profile" onClick={setCommentChange}>自己紹介文</p>
							{isEditing ? (
								<>
								<textarea
									ref={textareaRef}
									className="w-full mt-[10px] border rounded p-[5px] text-[13px]"
									rows={4}
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
								/>
								<div className="flex justify-center items-center mt-[15px] gap-[20px]">
									<div onClick={changeComment} className="flex justify-center items-center w-[100px] py-1 bg-blue-500 text-white text-[13px] rounded">保存</div>
									<div onClick={() => setIsEditing(false)} className="flex justify-center items-center w-[100px] py-1 bg-gray-300 text-[13px] rounded">キャンセル</div>
								</div>
								</>
							) : (
								<p className="flex justify-left items-center w-[100%] text-[13px] mt-[5px] mx-auto cursor-pointer whitespace-pre-wrap">
									{userProfile?.comment || "自己紹介が空欄です"}
								</p>
							)}
						</div>

						<div className="flex flex-col justify-center items-center w-[100%] mt-[28px]">
							<p className="my-self-profile" onClick={setMailChange}>メールアドレス</p>
							{isEditingMail ? (
							<>
								<textarea
									ref={textareaRef}
									className="w-full mt-[10px] border rounded p-[5px] text-[13px]"
									rows={1}
									value={mail}
									onChange={(e) => setMail(e.target.value)}
								/>
								<div className="flex justify-center items-center mt-[15px] gap-[20px]">
									<div onClick={changeMail} className="flex justify-center items-center w-[100px] py-1 bg-blue-500 text-white text-[13px] rounded">保存</div>
									<div onClick={() => setIsEditingMail(false)} className="flex justify-center items-center w-[100px] py-1 bg-gray-300 text-[13px] rounded">キャンセル</div>
								</div>
								</>
							) : (
								<p className="flex justify-left items-center w-[100%] text-[13px] mt-[5px] mx-auto cursor-pointer whitespace-pre-wrap">
									{userProfile?.email || "メールアドレスが設定されていません"}
								</p>
							)}
						</div>

						<div className="flex flex-col justify-center items-center w-[100%] mt-[28px]">
							<p className="flex justify-start items-center w-[100%] text-[14px] font-bold" >メール通知設定</p>
							<input 
								type="checkbox" 
								name="mail_receive_flg" 
								id="mail_receive_flg" 
								checked={userProfile?.mail_receive_flg ?? true}
								onChange={changeMailReceive}
								className="hidden"
							/>
							<label htmlFor="mail_receive_flg" className="prf-label left small mt-[7px]">メール通知</label>
							<div className="notice flex justify-start items-center w-[100%] text-[13px] mt-[10px] px-[10px] py-[5px] bg-[#ffe3d1] text-[#333] p-[5px] rounded-[6px]">
								特定のイベント開催時やイベントチケット購入時に<br/>お知らせ通知を送ります。
							</div>
						</div>
					</div>

					<div className="flex flex-col justify-center items-center w-[100%] mt-[30px] px-[20px]">
						<div className={`${friendList ? 'friend-active' : 'list-active'} relative flex justify-around items-center w-[100%] py-[8px] bg-[#D9D9D9] rounded-[6px] text-[#fff] text-[14px]`}>
							<div className="list-icon" onClick={() => setFriendList(false)}>イベント参加歴</div>
							<div className="friend-icon" onClick={() => setFriendList(true)}>友達リスト</div>
						</div>

						<div className="flex flex-col justify-center items-center w-[100%] mt-[20px] ">
							
							{friendList ? (
								<PrfFriendList groupMemberProfiles={groupMemberProfiles} fetchNextUser={fetchNextUser} hasMore={hasMore}/>
							) : (
								<PrfJoinGroup joinGroup={joinGroup} joinedGroup={joinedGroup}/>
							)}
						</div>
					</div>
				</div>
			)}

		</div>
	);
}