"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Header from "@/app/component/Header/Header";
import Footer from "@/app/component/Footer/Footer";
import Link from 'next/link';
import { useUserContext } from '@/app/utils/userContext';


export default function MessageBox() {
	const { userId, isHost, nowStatus } = useUserContext();
	const [joinedGroups, setJoinedGroups] = useState([]);

	useEffect(() => {
		if (!userId) return;

		const getJoinedGroups = async () => {
			let data, error;

			// --- グループ情報を取得 ---
			if (nowStatus === "host") {
				({ data, error } = await supabase
					.from("groups")
					.select("*")
					.eq("created_by", userId));
			} else {
				({ data, error } = await supabase
					.from("group_members")
					.select("group_id(*)")
					.eq("user_id", userId));
			}

			if (error || !data) {
				console.error(error);
				setJoinedGroups([]);
				return;
			}

			// --- 未読件数を取得 ---
			const { data: unreadCounts, error: unreadError } = await supabase.rpc("get_unread_counts", {
				p_user_id: userId,
			});
			if (unreadError) console.error("未読件数取得エラー:", unreadError);

			// 未読件数を group_id でマッピング
			const unreadMap = Object.fromEntries(
				(unreadCounts || []).map((item) => [item.group_id, item.unread_count])
			);

			// --- グループリストと未読件数を結合 ---
			let groupData;
			if (nowStatus === "host") {
				groupData = data.map((group) => ({
					...group,
					unread_count: unreadMap[group.id] || 0,
				}));
			} else {
				groupData = data.map((item) => {
					const group = item.group_id;
					return {
						...group,
						unread_count: unreadMap[group.id] || 0,
					};
				});
			}

			setJoinedGroups(groupData);
		};

		getJoinedGroups();
	}, [userId, nowStatus]);
	
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
		<div>
			<Header title={'メッセージリスト'}/>
			<div className="header-adjust">
				<ul >
				{joinedGroups.length ? (
					[...joinedGroups]
					.sort((a, b) => {
						const dateA = new Date(a.last_message_at || 0).getTime();
						const dateB = new Date(b.last_message_at || 0).getTime();
						return dateB - dateA; //メッセージが新しい順
					}).map((group) => (
						<li key={group.id}>
							<Link href={`/message_detail?groupId=${group.id}`} key={group.id}
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
									</div>
								</div>
							</Link>
						</li>
					))
				) : (
					<p className="text-gray-500 text-sm mt-4">参加しているグループはありません。</p>
				)}

				</ul>
			</div>
			<Footer/>
		</div>
	);
}
