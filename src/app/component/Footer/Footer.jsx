"use client";
import { useState } from 'react';
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Link from 'next/link';

export default function Footer({postBtn, openDialog}) {

	const alertPostBtn = () => {
		alert('マップをクリックして会場を決めてください')
	}

	return (
		<div className='fixed bottom-0 left-0 w-[100%] h-[50px] flex justify-around items-center bg-[#fff] text-[#666]'>
			<div className='w-[100%] h-[100%] flex justify-between items-center'>
				<Link href="/top" className='w-[20%] h-[100%] relative flex flex-col justify-center items-center footer-icon home'><div className="w-[100%] h-[100%] text-center"></div></Link>
				<Link href="/list_box" className='w-[20%] h-[100%] relative flex flex-col justify-center items-center footer-icon list'><div className="w-[100%] h-[100%] text-center"></div></Link>
				{postBtn ? (
					<div
						className="w-[20%] h-[100%] relative flex justify-center items-center footer-icon-center active"
						onClick={openDialog}
					></div>
				) : (
					<div className="w-[20%] h-[100%] relative flex justify-center items-center footer-icon-center"
						onClick={alertPostBtn}>
					</div>
				)}
				<Link href="/message_box" className='w-[20%] h-[100%] relative flex flex-col justify-center items-center footer-icon message'><div className="w-[100%] h-[100%] text-center"></div></Link>
				<Link href="/user_page" className='w-[20%] h-[100%] relative flex flex-col justify-center items-center footer-icon user'><div className="w-[100%] h-[100%] text-center"></div></Link>
			</div>
		</div>
	);
}
