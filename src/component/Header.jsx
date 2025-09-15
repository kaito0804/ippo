"use client";

import { supabase } from '@/utils/supabase/supabaseClient';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { useUserContext } from '@/utils/userContext';
import Link from 'next/link';

export default function Header() {

	const { userProfile } = useUserContext();
	const isHost = userProfile?.is_host;

	const  logout = async () => {
		try {
			// 1. Supabase ログアウト
			const { error: supaError } = await supabase.auth.signOut();
			if (supaError) console.error('Supabase ログアウト失敗:', supaError.message);

			// 2. LINE LIFF ログアウト
			if (window.liff && window.liff.isLoggedIn()) {
			window.liff.logout();
			console.log('✅ LIFF ログアウト成功');
			}

			// 3. NextAuth セッション破棄
			await nextAuthSignOut({ redirect: false }); // redirect しない場合
			console.log('✅ NextAuth セッション破棄成功');

			// 4. 最終的にトップページにリダイレクト
			window.location.href = '/';
		} catch (err) {
			console.error('ログアウト処理中にエラー:', err);
		}
	};

	return (
		<div className='fixed top-0 left-0 w-[100%] bg-[#fefaf1] z-50'>
			<div className='flex justify-between items-center w-[100%] pt-[30px] pb-[9px] px-[15px] border-b border-[#ebebeb]'>
				<Link href="/top" className='flex items-baseline gap-[8px]'>
					<div className='w-[100px] h-[45px] bg-contain bg-no-repeat bg-center' style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1753080491/IPPO__logo_tvu5ni.svg")`}}></div>
				</Link>
				<div className='flex justify-end items-baseline w-[calc(100%-120px)] gap-[14px]'>
					<Link href="/top" className='flex flex-col justify-center items-center'>
						<div className='w-[34px] h-[34px] bg-size-[140%] bg-no-repeat bg-center' style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1753231432/IPPO_graphics-tree01_tb0agz.svg")`}}></div>
						<p className='text-[11px] font-bold'>HOME</p>
					</Link>
					<Link href="/message_box" className='flex flex-col justify-center items-center'>
						<div className='w-[34px] h-[34px] bg-size-[160%] bg-no-repeat bg-center' style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1753231432/IPPO_graphics-tulip_ydbmay.svg")`}}></div>
						<p className='text-[11px] font-bold'>CHAT</p>
					</Link>
					<Link href="/about" className='flex flex-col justify-center items-center'>
						<div className='w-[34px] h-[34px] bg-size-[150%] bg-no-repeat bg-position-[-10px_-7px]' style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1753231432/IPPO_graphics-sneaker_cx4wns.svg")`}}></div>
						<p className='text-[11px] font-bold'>ABOUT</p>
					</Link>
					<Link href="/my_page" className='flex flex-col justify-center items-center'>
						<div className='w-[34px] h-[34px] bg-size-[280%] bg-no-repeat bg-center' style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1753231432/IPPO_graphics-camelhead_lwn5ui.svg")`}}></div>
						<p className='text-[11px] font-bold'>PROFILE</p>
					</Link>
					{isHost && (
						<Link href="/event_setting" className='flex flex-col justify-center items-center'>
							<div className='w-[34px] h-[34px] bg-size-[40px] bg-no-repeat bg-position-[-10px_-7px]' style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1755147831/graphics-bee_mnvwbd.svg")`}}></div>
							<p className='text-[11px] font-bold'>POST</p>
						</Link>
					)}
				</div>
            </div>

			{isHost && (
				<div onClick={logout} className='fixed bottom-[15px] right-[15px] w-[38px] h-[38px] bg-[#fff] border border-[#ebebeb] bg-size-[20px] bg-position-[center] bg-no-repeat rounded-[100px] '
					style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1751433532/log-out_u96vkj.svg")`}}>
				</div>
			)}
			
		</div>
	);
}
