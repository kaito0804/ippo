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
			<ul>
			{joinedGroups.length ? (
				joinedGroups.map((group) => (
					<Link href={`/message_detail?groupId=${group.id}`} key={group.id}>
						<li>{group.name}</li>
					</Link>
				))
			) : (
				<p className="text-gray-500 text-sm mt-4">参加しているグループはありません。</p>
			)}

			</ul>
			<Footer/>
		</div>
	);
}
