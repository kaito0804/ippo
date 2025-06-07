"use client";
import { useState } from 'react';
import { supabase } from "@/app/utils/supabase/supabaseClient";

export default function AuthButtons({authBtn, setAuthBtn}) {
	const [email, setEmail] = useState("");

	const signInWithGoogle = async () => {
		await supabase.auth.signInWithOAuth({
		provider: 'google',
		});
	};

	const signInWithEmail = async () => {
		if (!email) {
			alert("メールアドレスを入力してください");
			return;
		}

		const { error } = await supabase.auth.signInWithOtp({ email });

		if (error) {
			alert("送信に失敗しました：" + error.message);
		} else {
			alert("ログインリンクを送信しました！");
		}
	};

	return (
		<div className={`${authBtn ? 'bottom-0' : '-bottom-full'} absolute flex flex-col justify-center items-center gap-[30px] w-[100%] py-[35px] bg-[rgba(51,51,51,0.8)] rounded-t-[20px] transition-all duration-500`}>
			<div onClick={signInWithGoogle} className="btn-icon-google relative w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#fff] text-[#333] rounded-[100px] font-bold">Googleで{authBtn == 'new_reg' ? '登録' : 'ログイン'}<span className='hidden'><a target="_blank" href="https://icons8.com/icon/17949/google">Googleのロゴ</a> アイコン by <a target="_blank" href="https://icons8.com">Icons8</a></span></div>
			<div onClick={signInWithEmail}  className="btn-icon-mail relative w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#313131] text-white rounded-[100px] font-bold">メールで{authBtn == 'new_reg' ? '登録' : 'ログイン'}</div>
			<input
				type        = "email"
				placeholder = "メールアドレスを入力"
				value       = {email}
				onChange    = {(e) => setEmail(e.target.value)}
				className   = "w-[300px] py-[10px] px-[12px] rounded-full border border-gray-300"
			/>
		</div>
	);
}
