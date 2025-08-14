"use client";

//react/next.js用ライブラリ
import { useEffect, useState} from "react";
import Link from 'next/link'

//データベース関連
import { supabase } from "@/utils/supabase/supabaseClient";

//コンポーネント
import {startDay, formatDurationHM} from '@/utils/function/function';
import ListDetailDialog from '@/component/ListDetailDialog';

export default function PrfJoinGroup({userId}) {

	const [joinGroup, setJoinGroup]     = useState([]);
	const [joinedGroup, setJoinedGroup] = useState([]);
	const [group, setGroup]             = useState();

	/*===================================
	参加済みかつまだ終了していないグループを取得
	====================================*/
	useEffect(() => {
		if (!userId) return;

		const fetchOngoingGroups = async () => {
			const { data, error } = await supabase
			.rpc("get_my_ongoing_groups", { user_id: userId });

			if (error) {
			console.error("RPC取得エラー:", error);
			return;
			}

			setJoinGroup(data || []);
			console.log("参加済みかつ未終了グループ:", data);
		};

		fetchOngoingGroups();
	}, [userId]);


	/*===================================

	参加済みかつ既に終了しているグループを取得

	====================================*/
	useEffect(() => {
		if (!userId) return;

		const fetchFinishedGroups = async () => {
			const { data, error } = await supabase
				.rpc("get_my_finished_groups", { user_id: userId });

			if (error) {
				console.error("RPC取得エラー:", error);
				return;
			}

			setJoinedGroup(data || []);
			console.log("参加済みかつ終了済みグループ:", data);
		};

		fetchFinishedGroups();
	}, [userId]);




	return (
		<div className="flex flex-col justify-center items-center w-[100%]">
			{/*予約中*/}
			{joinGroup && joinGroup.length > 0 && (
				<ul className="flex flex-col justify-center items-center w-[100%] px-[20px] py-[20px] bg-[#fff]">
					<div className="flex justify-center items-center w-[100%] mb-[14px]">
						<p className="icon-left reservation w-[100%] text-[16px] font-bold">予約中</p>
						<div className="flex justify-center items-center w-[24px] h-[24px] bg-[#F26A21] text-[#fff] text-[13px] rounded-[3px]">{joinGroup.length}</div>
					</div>
					{joinGroup.map((group) => (
						<li key={group.id} className="flex flex-col justify-center items-center w-[100%] mt-[14px]">
							<div className="flex justify-between items-center w-[100%]">
								<div className="flex justify-start items-center  max-w-[calc(100%-78px)] gap-[10px]">
									<p className="scrollbar-hide overflow-x-scroll whitespace-nowrap text-[13px] font-bold">{group.name} {startDay(group.start_date)} {group.start_time.slice(0, 5)}~</p>
								</div>
								<div className="flex justify-center items-center gap-[10px]">
									<div onClick={() => {setGroup(group);}} className="w-[24px] h-[24px]  bg-center bg-cover bg-no-repeat" style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1755134489/Info_orange_uxa89c.svg")`}}></div>
									<Link href={`message_detail?groupId=${group.id}`} className="w-[24px] h-[24px] rounded-full bg-center bg-contain bg-no-repeat"  style={{ backgroundImage: `url('${'https://res.cloudinary.com/dnehmdy45/image/upload/v1755134489/Message_circle_orange_kpeayg.svg'}')` }}></Link>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}

			{/*参加歴*/}
			{joinedGroup && joinedGroup.length > 0 && (
				<ul className="flex flex-col justify-center items-center w-[100%] mt-[24px] px-[20px] py-[20px] bg-[#fff]">
					<div className="flex justify-center items-center w-[100%] mb-[14px]">
						<p className="icon-left history w-[100%] text-[16px] font-bold">参加歴</p>
						<div className="flex justify-center items-center w-[24px] h-[24px] bg-[#606060] text-[#fff] text-[13px] rounded-[3px]">{joinedGroup.length}</div>
					</div>
					{joinedGroup.map((group) => (
						<li key={group.id} className="flex flex-col justify-center items-center w-[100%] mt-[14px]">
							<div className="flex justify-between items-center w-[100%]">
								<div className="flex justify-start items-center  max-w-[calc(100%-78px)] gap-[10px]">
									<p className="scrollbar-hide overflow-x-scroll whitespace-nowrap text-[13px] font-bold">{group.name} {startDay(group.start_date)} {group.start_time.slice(0, 5)}~</p>
								</div>
								<div className="flex justify-center items-center gap-[10px]">
									<div onClick={() => {setGroup(group);}} className="w-[24px] h-[24px]  bg-center bg-cover bg-no-repeat" style={{backgroundImage: `url("https://res.cloudinary.com/dnehmdy45/image/upload/v1755134489/Info_orange_uxa89c.svg")`}}></div>
									<Link href={`message_detail?groupId=${group.id}`} className="w-[24px] h-[24px] rounded-full bg-center bg-contain bg-no-repeat"  style={{ backgroundImage: `url('${'https://res.cloudinary.com/dnehmdy45/image/upload/v1755134489/Message_circle_orange_kpeayg.svg'}')` }}></Link>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}
			
			<ListDetailDialog group={group} setGroup={setGroup}/>
		</div>
	);
}