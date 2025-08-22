"use client";

import { useEffect, useState } from "react";
import Link from 'next/link'

import { supabase } from "@/utils/supabase/supabaseClient";
import { getLabelById } from "@/utils/function/function";
import { useUserContext } from "@/utils/userContext";
import {startDay} from '@/utils/function/function';
import Header from "@/component/Header";
import ListDetailDialog from '@/component/ListDetailDialog';

export default function UserPageClient({ targetUserId }) {
	const { userProfile } = useUserContext();
	const userId          = userProfile?.id;

	const [profile, setProfile] = useState(null);
	const [groups, setGroups] = useState([]);
	const [group , setGroup] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!targetUserId || !userId) return;

		const fetchData = async () => {
			try {
				const { data: profileData, error: profileError } = await supabase
				.from("user_profiles")
				.select("*")
				.eq("id", targetUserId)
				.single();

				if (profileError) throw profileError;
				setProfile(profileData);

				const { data: groupsData, error: groupsError } = await supabase
				.rpc("get_my_groups_with_user", {
					p_current_user: userId,
					p_target_user: targetUserId,
				});

				if (groupsError) throw groupsError;
				setGroups(groupsData || []);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [targetUserId, userId]);

	if (loading) return <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex justify-center items-center">
							<p className="text-xl text-[#ff7a00] font-bold animate-pulse">読み込み中です...</p>
						</div>;

	if (!profile) return <div>プロフィールが見つかりません</div>;

	return (
		<div>
			<Header title={`${profile.display_name || "ユーザー"}のプロフィール`} />

			<div className="h-adjust header-adjust overflow-y-scroll">

				{profile.is_host && (
					<div className="flex flex-col items-center justify-center w-[60px] mt-[10px] ml-[10px] py-[4px] bg-[#ff7a00] rounded-[100px] text-[#fff] text-[12px]">
						運営
					</div>	
				)}

				<div className="flex flex-col items-center justify-center py-[30px] px-[20px]">
					<div className="user-icon-box">
						<div
							className="user-icon"
							style={{
							backgroundImage: `url('${profile.icon_path || "https://res.cloudinary.com/dnehmdy45/image/upload/v1750906560/user-gray_jprhj3.svg"}')`,
							}}
						></div>
					</div>
					
					<p className="relative text-[16px] font-bold mt-[10px]">
						{profile.display_name || "匿名"}
						{!profile.is_host && groups && groups.length > 0 && (
							<Link href={`../message_detail?user=${profile.id}`} className="absolute right-[-30px] w-[24px] h-[24px] rounded-full bg-center bg-contain bg-no-repeat"  
							style={{ backgroundImage: `url('${'https://res.cloudinary.com/dnehmdy45/image/upload/v1755134489/Message_circle_orange_kpeayg.svg'}')` }}></Link>
						)}
					</p>

					<div className="flex flex-col justify-center items-center w-[100%] mt-[14px] gap-[5px]">
						<p className="text-[13px]">年代 : {getLabelById(profile?.age, 'age')}</p>
						<p className="text-[13px]">趣味 : {getLabelById(profile?.hobby, 'hobby')}</p>
					</div>

					<div className="flex flex-col justify-center items-center w-[100%] mt-[20px]">
						<p className="flex justify-left items-center w-[100%] text-[14px] font-bold">自己紹介文</p>
						<p className="flex justify-left items-center w-[100%] text-[13px] mt-[10px] mx-auto cursor-pointer whitespace-pre-wrap">
							{profile?.comment || "自己紹介が空欄です"}
						</p>
					</div>

					{/*参加歴*/}
					{groups && groups.length > 0 && (
						<ul className="flex flex-col justify-center items-center w-[100%] mt-[24px] px-[20px] py-[20px] bg-[#fff]">
							<div className="flex justify-center items-center w-[100%] mb-[14px]">
								<p className="icon-left users w-[100%] text-[16px] font-bold">一緒に参加したイベント</p>
								<div className="flex justify-center items-center w-[24px] h-[24px] bg-[#F26A21] text-[#fff] text-[13px] rounded-[3px]">{groups.length}</div>
							</div>
							{groups.map((group) => (
								<li key={group.id} className="flex flex-col justify-center items-center w-[100%] mt-[14px]">
									<div className="flex justify-between items-center w-[100%]">
										<div className="flex justify-start items-center  max-w-[calc(100%-78px)] gap-[10px]">
											<p className="scrollbar-hide overflow-x-scroll whitespace-nowrap text-[13px] font-bold">{group.name} {startDay(group.start_date)} {group.start_time.slice(0, 5)}~</p>
										</div>
										<div className="flex justify-center items-center gap-[10px]">
											<div onClick={() => {setGroup(group);}} className="w-[24px] h-[24px]  bg-center bg-cover bg-no-repeat" style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1755134489/Info_orange_uxa89c.svg")`}}></div>
											<Link href={`../message_detail?groupId=${group.id}`} className="w-[24px] h-[24px] rounded-full bg-center bg-contain bg-no-repeat"  style={{ backgroundImage: `url('${'https://res.cloudinary.com/dnehmdy45/image/upload/v1755134489/Message_circle_orange_kpeayg.svg'}')` }}></Link>
										</div>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			<ListDetailDialog group={group} setGroup={setGroup}/>

		</div>
	);
}
