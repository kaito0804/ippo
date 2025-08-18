"use client";

//stripe関連
import { stripeClick } from '@/utils/stripe/stripeClick';

//クライアントコンポーネント
import { useUserContext } from '@/utils/userContext';
import {startDay, formatDurationHM} from '@/utils/function/function';


export default function PaymentDialog({group, open, setOpen}) {

	const { userProfile }   = useUserContext();
	const userId = userProfile.id;
	const { onStripeClick } = stripeClick(userId);

	return (
		<div className="listDetailDialog h-adjust content-bg-color overflow-y-scroll overflow-x-hidden" style={open ? {bottom:'0'} : {bottom:'-100%'}}>
			<div className="content-bg-color sticky flex justify-between items-center py-[10px] top-0 left-0 w-[100%]">
				<p className="text-[16px] font-bold leading-[1]">選択中のイベント</p>
				<div onClick={() => {setOpen('');}} className="w-[28px] h-[28px] bg-center bg-contain bg-no-repeat" style={{backgroundImage: 'url("https://res.cloudinary.com/dnehmdy45/image/upload/v1750818660/xmark_dv4bnv.svg")'}}></div>
			</div>
			{group ? (
				<div className="flex flex-col items-center justify-center w-[100%] mt-[10px]">
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

					<div onClick={() => onStripeClick(group)} className="flex items-center justify-center w-[280px] mt-[50px] py-[10px] bg-[#F26A21] rounded-[100px] text-white text-[16px] font-bold">
						チケットを購入する
					</div>

				</div>
				
			) : (
				<p>読み込み中...</p>
			)}
		</div>
	);
}
