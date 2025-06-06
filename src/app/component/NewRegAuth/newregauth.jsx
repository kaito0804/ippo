"use client";
import { supabase } from "@/app/utils/supabase/supabaseClient";

export default function AuthButtons() {
	const signInWithGoogle = async () => {
		await supabase.auth.signInWithOAuth({
		provider: 'google',
		});
	};

	const signInWithApple = async () => {
		await supabase.auth.signInWithOAuth({
		provider: 'apple',
		});
	};

	const signInWithEmail = async () => {
		const { data, error } = await supabase.auth.signInWithOtp({
			email: 'your@example.com', // ← 入力フォームから取得するように
		});
	};

	return (
		<div className="absolute bottom-[0] flex flex-col justify-center items-center gap-[30px] w-[100%] py-[35px] bg-[rgba(51,51,51,0.8)] rounded-t-[20px]">
			<div onClick={signInWithGoogle} className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#ff9731] text-white rounded-[100px] font-bold">Googleでログイン</div>
			<div onClick={signInWithApple}  className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#ff9731] text-white rounded-[100px] font-bold">Appleでログイン</div>
			<div onClick={signInWithEmail}  className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#ff9731] text-white rounded-[100px] font-bold">メールでログインリンクを送る</div>
		</div>
	);
}
