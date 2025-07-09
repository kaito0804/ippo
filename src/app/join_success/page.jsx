"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default function SuccessPage() {
	const searchParams = useSearchParams();
	const group = searchParams.get('group');
	const [status, setStatus] = useState("参加登録中...");
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	);

	useEffect(() => {
		if (!group) return;

		async function joinGroup() {
		try {
			const {
			data: { session },
			} = await supabase.auth.getSession();

			const token = session?.access_token;
			if (!token) {
			setStatus("未ログインです。");
			return;
			}

			const res = await fetch("/api/joinGroup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ groupId: group }),
			});

			if (res.ok) {
			setStatus("参加登録が完了しました！");
			} else {
			const { error, message } = await res.json();
			setStatus(error || message || "参加登録に失敗しました。");
			}
		} catch (e) {
			console.error(e);
			setStatus("エラーが発生しました。");
		}
		}

		joinGroup();
	}, [group]);

	return ( 
		<div>
			<p>{status}</p>
			<Link href="/">トップページへ戻る</Link>
		</div>
	);
}
