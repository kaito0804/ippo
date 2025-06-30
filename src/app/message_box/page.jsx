"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Header from "@/app/component/Header/Header";
import Footer from "@/app/component/Footer/Footer";
import Link from 'next/link';
import { useUserContext } from '@/app/utils/userContext';


export default function MessageBox() {

	const { userId, isHost, nowStatus }   = useUserContext();
	const [joinedGroups, setJoinedGroups] = useState([]);

	useEffect(() => {
		if (!userId) return;

		const getJoinedGroups = async () => {
		let data, error;

		if (nowStatus === "host") {
			// hostならgroupsテーブルからcreated_byがuserIdのものを取得
			({ data, error } = await supabase
			.from("groups")
			.select("*")
			.eq("created_by", userId));
		} else {
			// それ以外はgroup_membersから参加グループを取得
			({ data, error } = await supabase
			.from("group_members")
			.select("group_id(*)")
			.eq("user_id", userId));
		}

		if (error) {
			console.error(error);
			setJoinedGroups([]);
		} else if (data) {
			if (nowStatus === "host") {
			// groupsテーブルのデータをそのままセット
			setJoinedGroups(data);
			} else {
			// group_members経由の場合はgroup_idの中身だけ取り出す
			const groupData = data.map((item) => item.group_id);
			setJoinedGroups(groupData);
			}
		}
		};

		getJoinedGroups();
	}, [userId, nowStatus]);

	return (
		<div>
			<Header title={'メッセージリスト'}/>
			<div className="header-adjust">
				<ul >
				{joinedGroups.length ? (
					joinedGroups.map((group) => (
						<li key={group.id}>
							<Link href={`/message_detail?groupId=${group.id}`} key={group.id}
								  className="flex items-center justify-between border-b border-gray-200 py-[14px] px-[14px]">
								<div className="flex items-center">
									<div className="w-[50px] h-[50px] mr-[12px] bg-cover bg-center bg-no-repeat rounded-full" style={{ backgroundImage: `url(${group.image_url})` }}></div>
								
									<div>
										<p className="text-[15px] font-bold">{group.name}</p>
										<p className="text-[13px] text-gray-500">メッセージが届いています</p>
									</div>
								</div>
								<div className="flex flex-col items-end justify-right">
									<p className="text-[11px] text-gray-500">2時間前</p>
									<p className="text-[12px] text-white bg-[#ff4343] rounded-full w-[20px] h-[20px] mt-[5px] flex justify-center items-center">1</p>
								</div>
							</Link>
						</li>
					))
				) : (
					<p className="text-gray-500 text-sm mt-4">参加しているグループはありません。</p>
				)}

				</ul>
			</div>
			<Footer/>
		</div>
	);
}
