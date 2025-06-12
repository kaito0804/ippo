"use client";
import { useState } from 'react';
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Link from 'next/link';

export default function Header({title}) {

	return (
		<div>
			<div className='w-[100%] py-[14px] px-[15px] border-b border-gray-300'>
                <p className='text-[18px] font-bold'>{title}</p>
            </div>
		</div>
	);
}
