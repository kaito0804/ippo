"use client";
import { useState } from 'react';
import { supabase } from "@/app/utils/supabase/supabaseClient";

export default function AuthButtons({ authBtn, setAuthBtn }) {
	const [email, setEmail] = useState("");

	const redirectTo =
		process.env.NODE_ENV === 'development'
			? 'http://localhost:3000/top'
			: 'https://ippo-sampo.vercel.app/top';

	const signInWithGoogle = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo
			}
		});
	};

	// LINEログイン開始
	const signInWithLine = () => {
		const auth0Domain = "dev-8niza83ncu4nqh2o.us.auth0.com";
		const clientId = "StmPak8MbLNz7PBJqS17BX6hfmckddXS";
		const redirectUri = process.env.NEXT_PUBLIC_APP_URL + "/login_loading" || "https://ippo-sampo.vercel.app/login_loading";

		// response_type を "id_token token" に変更
		const url = `https://${auth0Domain}/authorize?response_type=id_token%20token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&connection=line&scope=profile openid email&nonce=${Date.now()}`;

		console.log('Auth0 URL:', url);
		window.location.href = url;
	};


	const signInWithEmail = async () => {
		if (!email) {
			alert("メールアドレスを入力してください");
			return;
		}

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				redirectTo
			}
		});

		if (error) {
			alert("送信に失敗しました：" + error.message);
		} else {
			alert("ログインリンクを送信しました！");
		}
	};

	return (
		<div className={`${authBtn ? 'bottom-0' : '-bottom-full'} absolute flex flex-col justify-center items-center gap-[30px] w-[100%] py-[35px] bg-[rgba(51,51,51,0.8)] rounded-t-[20px] transition-all duration-500`}>
			<div onClick={signInWithGoogle} className="btn-icon-google relative w-[300px] py-[12px] pl-[13px] flex flex-col justify-center items-center bg-[#fff] text-[#333] rounded-[100px] font-bold">
				Googleで{authBtn == 'new_reg' ? '登録' : 'ログイン'}
			</div>

			<div onClick={signInWithLine} className="btn-icon-line relative w-[300px] py-[12px] pl-[13px] flex flex-col justify-center items-center bg-[#06C755] text-white rounded-[100px] font-bold">
				LINEで{authBtn == 'new_reg' ? '登録' : 'ログイン'}
			</div>

			{/*
			<div onClick={signInWithEmail} className="btn-icon-mail relative w-[300px] py-[12px] pl-[15px] flex flex-col justify-center items-center bg-[#313131] text-white rounded-[100px] font-bold">
				メールで{authBtn == 'new_reg' ? '登録' : 'ログイン'}
			</div>

			<input
				type="email"
				placeholder="メールアドレスを入力"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className="w-[300px] py-[10px] px-[12px] rounded-full border border-gray-300"
			/>
			*/}
		</div>
	);
}
