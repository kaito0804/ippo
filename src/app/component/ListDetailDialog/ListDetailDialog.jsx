"use client";

//react/next.js用ライブラリ
import { useState, useEffect, useRef } from "react";

//stripe関連
import { stripeClick } from '@/app/utils/stripe/stripeClick';

//データベース関連
import { supabase } from '@/app/utils/supabase/supabaseClient';

//クライアントコンポーネント
import { useUserContext } from '@/app/utils/userContext';
import {groupListTemplate} from '@/app/utils/data/groupList';


export default function ListDetailDialog({selectPost, setSelectPost}) {

 	const { userId, isHost, nowStatus } = useUserContext();
	const [group, setGroup]             = useState(null);
	const { onStripeClick, joiningStatus } = stripeClick(userId);

	useEffect(() => {

		async function fetchGroups() {
			const { data, error } = await supabase
			.from('groups')
			.select('*')
			.eq('id', selectPost)
			.single();

			if (data) {
				setGroup(data);
			}
		}

		fetchGroups();
	}, [selectPost]);


	/*========================

	日付取得

	=========================*/
	function startDay(dateStr) {
		const date      = new Date(dateStr);
		const days      = ['日', '月', '火', '水', '木', '金', '土'];
		const year      = date.getFullYear();
		const month     = date.getMonth() + 1; // 月は0始まり
		const day       = date.getDate().toString().padStart(2, '0');
		const dayOfWeek = days[date.getDay()];

		return `${year}/${month}/${day}(${dayOfWeek})`;
	}

	return (
		<div className="listDetailDialog" style={selectPost ? {bottom:'0'} : {bottom:'-100%'}}>
			<div className="sticky flex justify-between items-center px-[10px] py-[10px] top-0 left-0 w-[100%] bg-[#fff]">
				<p className="text-[#ff7a00] text-[24px] font-bold font-poppins leading-[1]">IPPO</p>
				<div onClick={() => {setSelectPost(''); setGroup(null);}} className="w-[28px] h-[28px] bg-center bg-contain bg-no-repeat" style={{backgroundImage: 'url("https://res.cloudinary.com/dnehmdy45/image/upload/v1750818660/xmark_dv4bnv.svg")'}}></div>
			</div>
			{group ? (
		
				<div className="w-[100%] h-[100%]">
					<div className="w-[100%] h-[200px] bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url('${group.image_url}')` }} />
					<div className="flex flex-col items-center justify-start w-[100%] p-[20px] pb-[80px]">
						<p className="w-[100%] text-[16px] ">{startDay(group.start_date)} {group.start_time.slice(0, 5)} ~ <br/>{group.name}</p>
						<p className="w-[100%] text-[14px] mt-[5px]">{group.venue} | By 散歩コミュニティ「IPPO」</p>
						
						<ul className="flex flex-wrap w-[100%] text-[12px] mt-[15px] gap-[10px]">
							<li className="px-[10px] py-[2px] border border-[#ff7a00] text-[#ff7a00] rounded-[100px]">マッチング</li>
							<li className="px-[10px] py-[2px] border border-[#ff7a00] text-[#ff7a00] rounded-[100px]">友達づくり</li>
							<li className="px-[10px] py-[2px] border border-[#ff7a00] text-[#ff7a00] rounded-[100px]">コミュニティ</li>
							<li className="px-[10px] py-[2px] border border-[#ff7a00] text-[#ff7a00] rounded-[100px]">お茶</li>
							<li className="px-[10px] py-[2px] border border-[#ff7a00] text-[#ff7a00] rounded-[100px]">飲み会</li>
							<li className="px-[10px] py-[2px] border border-[#ff7a00] text-[#ff7a00] rounded-[100px]">イベント</li>
						</ul>

						{/*金額*/}
						<div className="flex flex-col items-start justify-between w-[100%] mt-[24px]">
							<p className="text-[14px] ">お申込みチケット</p>
							<p className="text-[14px] text-[#9e9e9f]">{group.price}{group.price !== 'free' ? '円' : ''}</p>
						</div>

						{/*開催日*/}
						<div className="flex flex-col items-start justify-between w-[100%] mt-[24px]">
							<p className="text-[14px]">{startDay(group.start_date)}</p>
							<p className="text-[14px]">{group.start_time.slice(0, 5)} ~ {group.end_time.slice(0, 5)}</p>
						</div>

						{/*場所*/}
						<div className="flex flex-col items-start justify-between w-[100%] mt-[24px]">
							<p className="text-[14px] ">{group.venue}</p>
							<p className="text-[14px] ">地図を見る</p>
						</div>

						<div dangerouslySetInnerHTML={{ __html:group.description }} className="w-[100%] text-[14px] text-[#333] mt-[24px]"/>

						<div dangerouslySetInnerHTML={{ __html: groupListTemplate(group) }} className="w-[100%] text-[14px] text-[#333] mt-[24px]"/>

					</div>

					
					<div onClick={() => onStripeClick(group)} className="fixed bottom-[10px] left-[50%] translate-x-[-50%] flex items-center justify-center w-[280px] py-[10px] bg-[#ff8b21] rounded-[100px] text-white text-[16px] font-bold">
						参加する
					</div>

				</div>
				
			) : (
				<p>読み込み中...</p>
			)}
		</div>
	);
}
