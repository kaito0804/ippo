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
		<div className='fixed top-0 left-0 w-[100%] z-50'>
			<div className='flex justify-between items-center w-[100%] py-[9px] px-[15px] bg-white border-b border-gray-300'>
				<Link href="/top" className='flex items-baseline gap-[8px]'>
					<div className='text-[#ff7a00] text-[30px] font-bold font-poppins leading-[1]'>IPPO</div>
				</Link>
				<div className='flex flex-col justify-center items-center'>
					<p onClick={Logout} className='logout'></p>
					<p className='text-[9px]'>ログアウト</p>
				</div>
            </div>
			<div className='flex items-center w-[100%] py-[8px] px-[15px] bg-[rgba(255,148,49,0.8)] text-white'>
				<p className='text-[14px] font-bold'>{title}</p>
			</div>
		</div>
	);
}
