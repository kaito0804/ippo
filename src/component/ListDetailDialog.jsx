"use client";

//react/next.js用ライブラリ
import { useState, useEffect, useRef } from "react";

//クライアントコンポーネント
import { useUserContext } from '@/utils/userContext';
import {startDay, formatDurationHM} from '@/utils/function/function';
import {groupListTemplate} from '@/utils/data/groupList';
import PaymentDialog from '@/component/paymentDialog';


export default function ListDetailDialog({group, setGroup}) {

 	const { userId }      = useUserContext();
	const [open, setOpen] = useState(false);

	return (
		<div className="listDetailDialog h-adjust content-bg-color" style={group ? {bottom:'0'} : {bottom:'-100%'}}>
			<div className="content-bg-color sticky flex justify-between items-center py-[10px] top-0 left-0 w-[100%]">
				<p className="text-[16px] font-bold leading-[1]">イベント詳細</p>
				<div onClick={() => {setGroup('');}} className="w-[28px] h-[28px] bg-center bg-contain bg-no-repeat" style={{backgroundImage: 'url("https://res.cloudinary.com/dnehmdy45/image/upload/v1750818660/xmark_dv4bnv.svg")'}}></div>
			</div>
			{group ? (
		
				<div className="w-[100%] h-[100%]">
					<div className="w-[100%] h-[202] bg-center bg-cover bg-no-repeat rounded-[8px]" style={{ backgroundImage: `url('${group.image_url}')` }} />
					<div className="flex flex-col items-center justify-start w-[100%] pt-[20px] pb-[80px]">
						<p className="w-[100%] text-[16px] ">{startDay(group.start_date)} {group.start_time.slice(0, 5)} ~ <br/>{group.name}</p>
						<p className="w-[100%] text-[14px] mt-[5px]">{group.venue} | By 散歩コミュニティ「IPPO」</p>
						
						<ul className="flex flex-wrap w-[100%] text-[12px] mt-[15px] gap-[10px]">
							{group.theme && group.theme.length > 0 ? (
								group.theme.map((theme, index) => (
									<li key={index} className="px-[10px] py-[2px] border border-[#ff7a00] text-[#ff7a00] rounded-[100px]">{theme}</li>
								))
							) : (
								<li className="px-[10px] py-[2px] border border-[#ff7a00] text-[#ff7a00] rounded-[100px]">散歩</li>
							)}
						</ul>

						{/*金額*/}
						<div className="flex flex-col items-start justify-between w-[100%] mt-[24px]">
							<p className="text-[14px] font-bold">お申込みチケット</p>
							<p className="text-[14px]">{group.price}{group.price !== 'free' ? '円' : ''}</p>
						</div>

						{/*開催日*/}
						<div className="flex flex-col items-start justify-between w-[100%] mt-[24px]">
							<p className="text-[14px] font-bold">開催日</p>
							<p className="text-[14px]">{startDay(group.start_date)} {group.start_time.slice(0, 5)} ~</p>
							<p className="text-[14px]">所要時間 約 {formatDurationHM(group.duration)}</p>
						</div>

						<div className="flex flex-col items-start justify-between w-[100%] mt-[24px]">
							<p className="text-[14px] font-bold">詳細</p>
							<div dangerouslySetInnerHTML={{ __html:group.description }} className="text-[14px] text-[#333]"/>
						</div>

						<div dangerouslySetInnerHTML={{ __html: groupListTemplate(group) }} className="w-[100%] text-[14px] text-[#333] mt-[24px]"/>

					</div>

					<div className="sticky bottom-[10px] flex items-center justify-center w-[100%]">
						{group.is_finished ? (
							<div className="flex items-center justify-center w-[280px] py-[10px] bg-[#888] rounded-[100px] text-white text-[16px] font-bold">
								終了しました
							</div>
						) : group.member?.includes(userId) ? (
							<div className="flex items-center justify-center w-[280px] py-[10px] bg-[#888] rounded-[100px] text-white text-[16px] font-bold">
								参加済み
							</div>
						) : group.member?.length >= group.member_count ? (
							<div className="fixed bottom-[10px] left-[50%] translate-x-[-50%] flex items-center justify-center w-[280px] py-[10px] bg-[#888] rounded-[100px] text-white text-[16px] font-bold">
								定員に達しました
							</div>
						) : (
							<div onClick={setOpen} className="fixed bottom-[10px] left-[50%] translate-x-[-50%] flex items-center justify-center w-[280px] py-[10px] bg-[#F26A21] rounded-[100px] text-white text-[16px] font-bold">
								チケットを購入する
							</div>
						)}
					</div>

					<PaymentDialog group={group} open={open} setOpen={setOpen} />

				</div>
				
			) : (
				<p>読み込み中...</p>
			)}
		</div>
	);
}
