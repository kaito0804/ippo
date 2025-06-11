"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Footer from "@/app/component/Footer/Footer";

export default function ListBox() {

	const [groups, setGroups] = useState([]);

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
			<ul className="flex flex-col w-[100%] h-[100vh] py-[40px] px-[20px] gap-[50px] overflow-y-scroll">
				{groups.map((group) => (
					<li key={group.id} className="w-[100%] shadow-lg rounded-[8px]">
						<div style={{ backgroundImage: `url(${group.image_url})`,backgroundSize: 'cover',backgroundPosition: 'center', backgroundRepeat: 'no-repeat', width: '100%',height: '200px', borderRadius: '8px 8px 0 0',}}></div>
						<p>{group.name}</p>
						{/* <div dangerouslySetInnerHTML={{ __html: group.description }} /> */}
						<p>開始: {group.start_date}</p>
						<p>終了: {group.end_date}</p>
					</li>
				))}
			</ul>
			<Footer/>
		</div>
	);
}
