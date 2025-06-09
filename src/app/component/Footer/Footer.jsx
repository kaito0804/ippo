"use client";
import { useState } from 'react';
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Link from 'next/link';

export default function Footer() {

	return (
		<div>
			<ul className='fixed bottom-0 left-0 w-[100%] flex justify-center items-center'>
				<li className='w-[33%] flex justify-center items-center'><Link href="/top" className="text-center">HOME</Link></li>
				<li className='w-[33%] flex justify-center items-center'><Link href="/message_detail" className="text-center">MESSAGE</Link></li>
				<li className='w-[33%] flex justify-center items-center'><Link href="/mypage" className="text-center">MY</Link></li>
			</ul>
		</div>
	);
}
