"use client";
import Image from "next/image";
import { useState } from "react";
import AuthButtons from "@/app/component/NewRegAuth/newregauth";

export default function Home() {

	const [authBtn, setAuthBtn] = useState('');

	return (
		<div>
			<div onClick={() => setAuthBtn('')} className="flex flex-col justify-center items-center">

				<div className="flex flex-col justify-center items-center w-[100%] h-[100dvh] bg-[#fffcfa]">
					<div className="absolute top-[calc(50%-120px)] flex flex-col justify-center items-center text-[#ff7a00]">
						<p className="font-bold text-[60px]">IPPO</p>
						<p className="font-bold text-[18px]">散歩コミュニティ</p>
					</div>
				</div>	
				
				<div onClick={(e) => e.stopPropagation()} className={`${authBtn ? 'bottom-[-100%]' : 'bottom-[80px]'} absolute flex flex-col justify-center items-center gap-[30px] transition-all duration-500`}>
					<div onClick={() => setAuthBtn('login')} className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#4363ff] text-white rounded-[100px] font-bold">ログイン</div>
					<div onClick={() => setAuthBtn('new_reg')} className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#ff9731] text-white rounded-[100px] font-bold">新規アカウント作成</div>
				</div>
			</div>	

			<AuthButtons authBtn={authBtn} setAuthBtn={setAuthBtn}/>

		</div>
	);
}
