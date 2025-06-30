"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import { useUserContext } from '@/app/utils/userContext';
import Footer from "@/app/component/Footer/Footer";
import { useSearchParams } from "next/navigation";


export default function MessageDetailClient() {
const searchParams            = useSearchParams();
const groupId                 = searchParams.get("groupId")
const { userId, isHost, nowStatus, setNowStatus } = useUserContext();
const [messages, setMessages] = useState([]);
const [group, setGroup]       = useState(null);
const [newMsg, setNewMsg]     = useState("");

useEffect(() => {
	// 初回読み込み
	const fetchMessagesAndGroup = async () => {
		const [{ data: messageData, error: messageError }, { data: groupData, error: groupError }] = await Promise.all([
		supabase
			.from("messages")
			.select("*, user_id")
			.eq("group_id", groupId)
			.order("created_at", { ascending: true }),

		supabase
			.from("groups")
			.select("*")
			.eq("id", groupId)
			.single()
		]);

		if (messageError) {
		console.error("メッセージ取得エラー:", messageError.message);
		} else {
		setMessages(messageData);
		}

		if (groupError) {
		console.error("グループ取得エラー:", groupError.message);
		} else {
		setGroup(groupData);
		}
	};

	fetchMessagesAndGroup();

// リアルタイム購読
const subscription = supabase
	.channel("custom:messages")
	.on(
		"postgres_changes",
		{ event: "INSERT", schema: "public", table: "messages" },
		(payload) => {
			setMessages((prev) => [...prev, payload.new]);
		}
	)
	.subscribe();

	return () => {
		supabase.removeChannel(subscription);
	};
}, []);


// メッセージ送信
const sendMessage = async () => {
	const user = await supabase.auth.getUser();
	if (!user.data.user) {
		console.error("ユーザー情報が取得できません");
		return;
	}

	// display_name を取得
	const { data: profileData, error: profileError } = await supabase
		.from("user_profiles")
		.select("display_name")
		.eq("id", user.data.user.id)
		.single();

	if (profileError) {
		console.error("プロフィール取得エラー:", profileError.message);
		return;
	}

	// メッセージを送信
	const { data, error } = await supabase
		.from("messages")
		.insert([
		{
			content: newMsg,
			user_id: user.data.user.id,
			group_id: groupId,
			display_name: profileData.display_name,
		},
		]);

	if (error) {
		console.error("送信エラー:", error.message);
	} else {
		setNewMsg("");
	}
};


	return (
		<div>
			<div className="fixed top-[0] flex justify-left items-center w-[100%] py-[10px] px-[5px] bg-[#fff] border-b border-[#e0e0e0] z-[100]">
				<div className="w-[28px] h-[28px] mr-[10px] bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('https://res.cloudinary.com/dnehmdy45/image/upload/v1751266821/nav-arrow-left_orpd2v.svg')`}}></div>
				{group ? (
					<div className="flex items-center">
						<div className="w-[29px] h-[29px] mr-[10px] bg-cover bg-center bg-no-repeat rounded-full" style={{ backgroundImage: `url(${group.image_url})` }}></div>
						<p className="text-[12px] font-bold">{group.name}</p>
					</div>
				) : (
					<p>グループ情報を読み込み中...</p>
				)}
			</div>
			<div className="w-[100%] h-[calc(100dvh-50px)] pt-[50px] px-[16px] overflow-y-scroll">
				<ul className="w-[100%] py-[20px]">
					{(() => {
						const todayStr = new Date().toISOString().split("T")[0];
						const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

						const formatJapaneseDateWithDay = (isoDateStr) => {
							const date = new Date(isoDateStr);
							return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${weekdays[date.getDay()]})`;
						};

						const todaysMessages = messages.filter((msg) =>
							msg.created_at.startsWith(todayStr)
						);

						const firstTodayMsgId = todaysMessages.reduce((earliest, msg) =>
							new Date(msg.created_at) < new Date(earliest.created_at) ? msg : earliest,
							todaysMessages[0]
						)?.id;


						return messages.map((msg) => {
							const isOwnMessage = msg.user_id === userId;

							return (
							<li key={msg.id} className="flex flex-col mb-[10px]">
								{msg.id === firstTodayMsgId && (
									<div className="flex items-center justify-center my-2">
										<p className="inline-block mx-auto py-[2px] px-[12px] bg-[#a6a6a6] text-[#fff] rounded-[100px] text-[11px]">
										{formatJapaneseDateWithDay(todayStr)}
										</p>
									</div>
								)}
								{!isOwnMessage && (
									<div className="text-xs text-gray-500 font-bold mb-[1px]">
										{msg.display_name || "匿名"}
									</div>
								)}

								<div className={`flex items-center my-1 text-sm`}>
									<p className={`message-text ${
										isOwnMessage
										? "mine"
										: "others bg-gray-200 text-black mr-auto text-left"
									}`}>{msg.content}</p>
								</div>
							</li>
							);
						});
					})()}
				</ul>

				<input
					value={newMsg}
					onChange={(e) => setNewMsg(e.target.value)}
					placeholder="メッセージを入力"
				/>
				<div onClick={sendMessage}>送信</div>
			</div>

			<Footer/>
		</div>
	);
}
