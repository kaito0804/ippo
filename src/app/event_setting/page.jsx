"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

//データベース関連
import { useUserContext }   from '@/utils/userContext';

//コンポーネント
import Header        from "@/component/Header";
import NewPostDialog from '@/component/NewPostDialog';

export default function EventSetting() {

	const router = useRouter();
	const { userProfile } = useUserContext();
	const isHost = userProfile?.is_host;
	const [openDialog, setOpenDialog]     = useState(false);

	useEffect(() => {
		if (isHost === false) {
			router.push('/top');
		}
	}, [isHost, router]);


	return (
		<div className="content-bg-color">
			<Header/>

			{!userProfile ? (
			<div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex justify-center items-center">
				<p className="text-xl text-[#ff7a00] font-bold animate-pulse">読み込み中です...</p>
			</div>

			) : isHost ? (
				<div className="header-adjust">
					<div className='h-adjust flex flex-col justify-start items-center'>
						<p className='text-[20px] font-bold mt-[60px]'>イベント設定</p>
						<p className='text-[12px] mt-[2px]'>※管理者専用ページ</p>
						<div className='flex flex-col justify-center items-center mt-[30px]'>
							<div onClick={() => setOpenDialog(true)} className='flex justify-center items-center w-[220px] py-[12px] bg-[#F26A21] text-[#fff] rounded-[100px] text-[16px] font-bold'>イベントを作成</div>
							<div className='flex justify-center items-center w-[220px] mt-[20px] py-[12px] bg-[#fff] text-[#F26A21] border border-[#F26A21] rounded-[100px] text-[16px] font-bold'>イベントを編集</div>
						</div>
					</div>
					<NewPostDialog openDialog={openDialog} closeDialog={() => setOpenDialog(false)}/>
				</div>
			) : (
				<div className="header-adjust">
					<div className='h-adjust flex flex-col justify-start items-center'>
						<p className='text-[20px] font-bold mt-[60px]'>イベント設定</p>
						<p className='text-[12px] mt-[2px]'>※管理者専用ページのためリダイレクトします</p>
					</div>
				</div>
			)}
			
		</div>
	);
}
