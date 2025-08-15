"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import Header from "@/component/Header";
import Link from 'next/link';
import { useUserContext } from '@/utils/userContext';

import { isGroupFinished } from '@/utils/function/function';



export default function MessageBox() {
	const { userId }   = useUserContext();
	const [joinedGroups, setJoinedGroups] = useState([]);
	const [chatUsers, setChatUsers]       = useState([]);
	const [selectTab, setSelectTab]       = useState("group");
	const [loading, setLoading]           = useState(true);

	useEffect(() => {
		if (!userId) return;

		const getJoinedGroups = async () => {
			const { data, error } = await supabase
				.from("group_members")
				.select("group_id(*)")
				.eq("user_id", userId);

			if (error || !data) {
				console.error("グループ取得エラー:", error);
				setJoinedGroups([]);
				return;
			}

			// --- 未読件数を取得 ---
			const { data: unreadCounts, error: unreadError } = await supabase.rpc("get_unread_counts", {
				p_user_id: userId,
			});
			if (unreadError) console.error("未読件数取得エラー:", unreadError);

			const unreadMap = Object.fromEntries(
				(unreadCounts || []).map((item) => [item.group_id, item.unread_count])
			);

			// --- グループ情報と未読件数を統合 ---
			const groupData = data.map((item) => {
				const group = item.group_id;
				return {
					...group,
					unread_count: unreadMap[group.id] || 0,
				};
			});

			setJoinedGroups(groupData);
			setLoading(false);
		};

		getJoinedGroups();
	}, [userId]);


	useEffect(() => {
		async function fetchUserChats() {
			if (!userId) return;

			const { data: chats, error } = await supabase
				.from('user_chats')
				.select(`
					partner_id,
					last_message,
					last_message_at,
					last_sender_flag,
					user_profiles:partner_id (
						id,
						display_name,
						icon_path
					)
				`)
				.eq('user_id', userId)
				.order('last_message_at', { ascending: false });

			if (error) {
				console.error('チャット履歴取得エラー:', error);
				return;
			}

			setChatUsers(chats || []);
		}

		fetchUserChats();
	},[userId]); 

	
	function getTimeAgo(utcDateString) {
		if (!utcDateString) return "";

		const date = new Date(utcDateString); // UTCとしてパース
		const now  = new Date();              // ローカル（JST）

		const diff    = now.getTime() - date.getTime(); // ミリ秒差
		const minutes = Math.floor(diff / 60000);
		const hours   = Math.floor(minutes / 60);
		const days    = Math.floor(hours / 24);

		if (minutes < 1)  return "たった今";
		if (minutes < 60) return `${minutes}分前`;
		if (hours < 24)   return `${hours}時間前`;
		if (days < 7)     return `${days}日前`;

		return `${date.getMonth() + 1}/${date.getDate()}`;
	}


	return (
		<div className="content-bg-color">
			<Header/>

			<div style={{ display: loading ? 'flex' : 'none' }} className="fixed inset-0 bg-white bg-opacity-80 z-50 justify-center items-center">
				<p className="text-xl text-[#ff7a00] font-bold animate-pulse">読み込み中です...</p>
			</div>

			<div className="header-notitle-adjust">
				<div className={`${selectTab == 'group' ? 'select-group' : 'select-user'} select-tab `}>
					<div onClick={() => setSelectTab("group")} className="w-[50%] flex items-center justify-center text-[14px]">イベントグループ</div>
					<div onClick={() => setSelectTab("users")} className="w-[50%] flex items-center justify-center text-[14px]">DM</div>
				</div>

				{/*イベントグループ*/}
				{selectTab == 'group' && (
					<ul className="w-[100%] flex flex-col justify-center">
						{joinedGroups.length ? (
							[...joinedGroups]
							.sort((a, b) => {
								const dateA = new Date(a.last_message_at || 0).getTime();
								const dateB = new Date(b.last_message_at || 0).getTime();
								return dateB - dateA; //メッセージが新しい順
							}).map((group) => (
								<li key={group.id} className={isGroupFinished(group.start_date) ? 'order-[1] end-group' : 'order-[0]'}>
									<Link href={`/message_detail?groupId=${group.id}`}
										className="flex items-center justify-between border-b border-gray-200 py-[14px] px-[14px]">
										<div className="flex items-center">
											<div className="w-[50px] h-[50px] mr-[12px] bg-cover bg-center bg-no-repeat rounded-full" style={{ backgroundImage: `url(${group.image_url})` }}></div>
										</div>

										<div className="flex flex-col items-start justify-between w-[calc(100%-50px)] h-[100%] gap-[5px]">
											<div className="flex items-center justify-between w-full">
												<p className="text-[15px] font-bold">{group.name}</p>
												<p className="text-[11px] text-gray-500"> {getTimeAgo(group.last_message_at)}</p>
											</div>
											<div className="flex items-center justify-between w-full">
												<p className="text-[13px] text-gray-500">
													{group.last_message_at ? "メッセージが届いています" : "メッセージがまだありません"}
												</p>
												{group.unread_count > 0 && (
													<p className="text-[12px] text-white bg-[#ff4343] rounded-full w-[20px] h-[20px] flex justify-center items-center">
														{group.unread_count}
													</p>
												)}
												{isGroupFinished(group.start_date) && (
													<p className="flex justify-center items-center w-[100px] py-[4px] bg-[#cecece] rounded-full text-[#fff] text-[12px] z-10">イベント終了</p>
												)}
											</div>
										</div>
									</Link>
								</li>
							))
						) : (
							<p className="flex justify-center items-center w-[100%] text-[#5d5d5d] font-bold text-[14px] mt-[30px]">参加しているグループはありません</p>
						)}
					</ul>
				)}

				{/*DM*/}
				{selectTab == 'users' && (
					<ul>
						{chatUsers.length > 0 ? chatUsers.map((chatUser) => (
							<li key={chatUser.partner_id}>
								<Link href={`/message_detail?user=${chatUser.partner_id}`} className="flex items-center justify-between border-b border-gray-200 py-[14px] px-[14px]">
									<div className="flex items-center">
										<div
										className="w-[50px] h-[50px] mr-[12px] bg-cover bg-center bg-no-repeat rounded-full"
										style={{ backgroundImage: `url(${chatUser.user_profiles?.icon_path || '/default_icon.png'})` }}
										></div>
									</div>

									<div className="flex flex-col items-start justify-between w-[calc(100%-50px)] h-[100%] gap-[5px]">
										<div className="flex items-center justify-between w-full">
											<p className="text-[15px] font-bold">{chatUser.user_profiles?.display_name || "匿名"}</p>
											<p className="text-[11px] text-gray-500">{getTimeAgo(chatUser.last_message_at)}</p>
										</div>
										<div className="flex items-center justify-between w-full">
											<p className="text-[13px] text-gray-500">
												{chatUser.last_sender_flag ? "相手" : "あなた"} : {chatUser.last_message_at ? chatUser.last_message : "メッセージがまだありません"}
											</p>
											{chatUser.unread_count > 0 && (
												<p className="text-[12px] text-white bg-[#ff4343] rounded-full w-[20px] h-[20px] flex justify-center items-center">
												{chatUser.unread_count}
												</p>
											)}
										</div>
									</div>
								</Link>
							</li>
						)) : (
							<p className="flex justify-center items-center w-[100%] text-[#5d5d5d] font-bold text-[14px] mt-[30px]">話したことのある相手がいません</p>
						)}
					</ul>
				)}
				
			</div>
		</div>
	);
}
