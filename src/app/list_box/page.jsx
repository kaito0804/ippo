"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Header from "@/app/component/Header/Header";
import Footer from "@/app/component/Footer/Footer";

export default function ListBox() {

	const [groups, setGroups] = useState([]);
	const formatDate = (dateStr) => dateStr?.replace(/-/g, '/');

	useEffect(() => {
		const fetchGroups = async () => {
			const { data, error } = await supabase
			.from('groups')
			.select('*')
			.order('created_at', { ascending: false });

			if (error) {
				console.error('グループ取得エラー:', error.message);
			} else if (data) {
				setGroups(data);
			} else {
				setGroups([]);
			}
		};
		fetchGroups();
	}, []);


	return (
		<div>
			<Header title={'散歩一覧'}/>
			<ul className="flex flex-col w-[100%] h-[100vh] py-[40px] px-[20px] gap-[50px] overflow-y-scroll">
				{groups.map((group) => (
					<li key={group.id} className="w-[100%] shadow-lg rounded-[8px]">
						<div style={{ backgroundImage: `url(${group.image_url})`,backgroundSize: 'cover',backgroundPosition: 'center', backgroundRepeat: 'no-repeat', width: '100%',height: '200px', borderRadius: '8px 8px 0 0',}}></div>
						<div className="py-[10px] px-[15px]">
							<p className="text-[15px] font-bold">{group.name}</p>
							<div className="flex items-center gap-[14px] mt-[8px]">
								<p className="date-icon-text flex items-center text-[12px] text-[#888]">{group.start_date === group.end_date ? formatDate(group.start_date) : `${formatDate(group.start_date)} ~ ${formatDate(group.end_date)}`}</p>
								<p className="time-icon-text flex items-center text-[12px] text-[#888]">{group.start_time.slice(0, 5)} ~ {group.end_time.slice(0, 5)}</p>
							</div>
							<p className="locate-icon-text flex items-center text-[12px] text-[#888] mt-[8px]">{group.venue}</p>
							<div dangerouslySetInnerHTML={{ __html: group.description }} className="text-[14px] text-[#333] mt-[8px]" />
							<div className="flex justify-center align-center w-[80px] mt-[10px] py-[3px] bg-[#3B82F6] text-white rounded-[4px] text-[12px] font-bold">参加応募</div>
						</div>
					</li>
				))}
			</ul>
			<Footer/>
		</div>
	);
}
