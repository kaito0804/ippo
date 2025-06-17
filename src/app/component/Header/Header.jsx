"use client";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Link from 'next/link';

export default function Header({title}) {

	const router = useRouter();

	const Logout = async () => {
		// 現在ログインしているユーザーID取得
		const user = supabase.auth.getUser();

		const { data: { user: currentUser } } = await user;

		if (!currentUser) {
		alert("ユーザーがログインしていません");
		return;
		}

		// now_statusを空に更新
		const { error: updateError } = await supabase
		.from("user_profiles")
		.update({ now_status: null }) // もしくは "" にしたいなら .update({ now_status: "" })
		.eq("id", currentUser.id);

		if (updateError) {
		alert("ステータス更新に失敗しました");
		console.error(updateError);
		return;
		}

		// ログアウト処理
		const { error: signOutError } = await supabase.auth.signOut();
		if (signOutError) {
		alert("ログアウトに失敗しました");
		console.error(signOutError);
		} else {
		router.push("/");
		}
	};

	return (
		<div>
			<div className='flex justify-between items-center w-[100%] py-[14px] px-[15px] border-b border-gray-300'>
                <p className='text-[18px] font-bold'>{title}</p>
				<p onClick={Logout} className='text-[14px] font-bold'>ログアウト</p>
            </div>
		</div>
	);
}
