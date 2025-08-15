"use client";

//react/next.js用ライブラリ
import Link from 'next/link'

export default function PrfFriendList({groupMemberProfiles, fetchNextUser, hasMore}) {

	return (
		<div className="flex flex-col justify-center items-center w-[100%]">
			<ul className="flex flex-col justify-center items-center w-[100%] px-[20px] py-[20px] bg-[#fff]">
				<p className="icon-left smile w-[100%] text-[16px] font-bold mb-[14px]">友達リスト</p>
				{groupMemberProfiles && groupMemberProfiles.length > 0 ? (
					<div className="flex flex-col justify-center items-center w-[100%]">
						{groupMemberProfiles.map((prf) => (
							<li key={prf.id} className="flex flex-col justify-center items-center w-[100%] mt-[14px]">
								<div className="flex justify-between items-center w-[100%]">
									<div className="flex justify-center items-center gap-[10px]">
										<Link href={`/user_page/${prf.id}`} className="w-[30px] h-[30px] rounded-full bg-center bg-cover bg-no-repeat border border-[#e1e1e1]" style={{ backgroundImage: `url('${prf.icon_path || 'https://res.cloudinary.com/dnehmdy45/image/upload/v1750906560/user-gray_jprhj3.svg'}')` }}></Link>
										<p className="text-[13px] font-bold">{prf.display_name}</p>
									</div>
									<div className="flex justify-center items-center gap-[10px]">
										<Link href={`/user_page/${prf.id}`} className="w-[24px] h-[24px]  bg-center bg-cover bg-no-repeat" style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1755074557/User_orange_epxik2.svg")`}}></Link>
										<Link href={`message_detail?user=${prf.id}`} className="w-[24px] h-[24px] rounded-full bg-center bg-contain bg-no-repeat"  style={{ backgroundImage: `url('${'https://res.cloudinary.com/dnehmdy45/image/upload/v1755134489/Message_circle_orange_kpeayg.svg'}')` }}></Link>
									</div>
								</div>
							</li>
						))}
						{hasMore && (
							<button className="flex justify-center items-center w-[220px] py-[10px] bg-[#F26A21] text-[#fff] rounded-[100px] text-[14px] font-bold mt-[20px]"
							        onClick={() => fetchNextUser(false)} >
								もっと見る
							</button>
						)}
					</div>
				) : (
					<div className="flex flex-col justify-center items-center w-[100%] mt-[14px]">
						<p className="text-[14px] text-[#333] font-bold">友達リストがありません</p>
						<p className="text-[14px] text-[#F26A21] font-bold">イベントに参加して友達になりましょう！</p>
						<Link href="/top" className="flex justify-center items-center w-[220px] py-[10px] bg-[#F26A21] text-[#fff] rounded-[100px] text-[14px] font-bold mt-[20px]">散歩イベントを探す</Link>
					</div>
				)}
			</ul>
			
		</div>
	);
}