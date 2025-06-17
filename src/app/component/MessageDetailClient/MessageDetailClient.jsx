"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Footer from "@/app/component/Footer/Footer";
import { useSearchParams } from "next/navigation";


export default function MessageDetailClient() {
const searchParams            = useSearchParams();
const groupId                 = searchParams.get("groupId")
const [messages, setMessages] = useState([]);
const [newMsg, setNewMsg]     = useState("");

useEffect(() => {
// 初回読み込み
const fetchMessages = async () => {
	const { data, error } = await supabase
	.from("messages")
	.select("*, user_id")
	.eq("group_id", groupId)
	.order("created_at", { ascending: true });

	if (error) {
		console.error("取得エラー:", error.message);
	} else {
		setMessages(data);
	}
};

fetchMessages();

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
const { data, error } = await supabase
	.from("messages")
	.insert([
		{
			content: newMsg,
			user_id: user.data.user.id,
			group_id: groupId,
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
			<h2>グループチャット</h2>
			<div className="chat-box">
				{messages.map((msg) => (
				<div key={msg.id}>
					<strong>{msg.users?.email || "匿名"}:</strong> {msg.content}
				</div>
				))}
			</div>
			<input
				value={newMsg}
				onChange={(e) => setNewMsg(e.target.value)}
				placeholder="メッセージを入力"
			/>
			<div onClick={sendMessage}>送信</div>

			<Footer/>
		</div>
	);
}
