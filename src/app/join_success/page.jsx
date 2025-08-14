// src/app/join_success/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'

//データベース関連
import { supabase }         from '@/utils/supabase/supabaseClient';

//コンポーネント
import { useQueryParam } from '@/utils/data/useQueryParam';
import {startDay, formatDurationHM} from '@/utils/function/function';
import Header  from "@/component/Header";


export default function JoinSuccessPage({ searchParams }) {
  	const sessionId           = useQueryParam('session_id') || searchParams.session_id;
	const groupId             = useQueryParam('group');
  	const [result, setResult] = useState(null);
	const [group, setGroup]   = useState(null);

	useEffect(() => {
		if (!sessionId) return;

		async function checkPayment() {
			const res  = await fetch(`/api/checkPayment?session_id=${sessionId}`);
			const data = await res.json();
			setResult(data.success);
		}
		
		checkPayment();
	}, [sessionId]);

	useEffect(() => {
		if (!groupId) return;

		async function getGroup() {
			const { data: group, error: error } = await supabase
			.from('groups')
			.select('*')
			.eq('id', groupId)
			.single();

			if (error) {
				console.error('グループ情報取得エラー:', error);
			} else {
				setGroup(group);
			}
		}

		getGroup();

	}, [groupId]);

  	if (result === null) return <p>読み込み中...</p>;

  	return (
   		<div>
			<Header />
			{result ? (
				<div className="flex flex-col items-center w-[100%] px-[28px] h-adjust header-adjust overflow-y-scroll overflow-x-hidden">
					<p className="flex items-center justify-center w-[100%] py-[20px] text-[#F26A21] text-[16px] font-bold leading-[1]">決済が完了しました</p>
					{group ? (
						<div className="flex flex-col items-center justify-center w-[100%]">
							<div className="bee-icon relative w-[100%] py-[10px] px-[15px] bg-[#fff]">
								<ul>
									<li>
										<p className="text-[#606060] text-[12px] font-bold">イベント</p>
										<p className="text-[18px] font-bold">{group.name}</p>
									</li>
									<li className="mt-[24px]">
										<p className="text-[#606060] text-[12px] font-bold">日時</p>
										<p className="text-[18px] font-bold">{startDay(group.start_date)} {group.start_time.slice(0, 5)} ~</p>
									</li>
									<li className="mt-[24px]">
										<p className="text-[#606060] text-[12px] font-bold">ルート</p>
										<p className="text-[18px] font-bold">{group.venue}~{group.goal}</p>
									</li>
									<li className="mt-[24px]">
										<p className="text-[#606060] text-[12px] font-bold">所要時間</p>
										<p className="text-[18px] font-bold">約 {formatDurationHM(group.duration)}</p>
									</li>
									<li className="mt-[24px]">
										<p className="text-[#606060] text-[12px] font-bold">参加費</p>
										<p className="text-[#F26A21] text-[18px] font-bold">¥{group.price}</p>
									</li>
								</ul>
							</div>
			
							<Link href={`message_detail?groupId=${group.id}`} className="flex items-center justify-center w-[280px] mt-[50px] py-[10px] bg-[#F26A21] rounded-[100px] text-white text-[16px] font-bold">
								次へ
							</Link>
			
						</div>
						
					) : (
						<p>読み込み中...</p>
					)}
				</div>
			) : (	
				<p>支払いに失敗しました</p>
			)}
    	</div>
  	);
}
