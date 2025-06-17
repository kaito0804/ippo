"use client";
import { useState } from 'react';
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Link from 'next/link';

export default function Footer() {

	return (
		<div className='w-[100%]'>
			<ul className='fixed bottom-0 left-0 w-[100%] flex justify-center items-center bg-[#fff]'>
				<li className='w-[25%] flex justify-center items-center'><Link href="/top" className="w-[100%] text-center">HOME</Link></li>
				<li className='w-[25%] flex justify-center items-center'><Link href="/list_box" className="w-[100%] text-center">LIST</Link></li>
				<li className='w-[25%] flex justify-center items-center'><Link href="/message_box" className="w-[100%] text-center">MESSAGE</Link></li>
				<li className='w-[25%] flex justify-center items-center'><Link href="/mypage" className="w-[100%] text-center">MY</Link></li>
			</ul>
		</div>
	);
}
