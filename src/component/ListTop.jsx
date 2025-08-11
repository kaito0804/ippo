// src/component/ListTop.jsx
"use client";

//react/next.js用ライブラリ
import { useState, useEffect} from "react";
import GroupSlider from "@/component/slider";

//データベース関連
import { supabase }         from '@/utils/supabase/supabaseClient';

export default function ListTop({ setSelectPost }) {

	const [groupData, setGroupData] = useState({ thisMonth: [], nextMonth: [] });

	useEffect(() => {
		const GetGroups                = async () => {
		const today                    = new Date();
		const startOfNextMonth         = new Date(today.getFullYear(), today.getMonth() + 1, 1);
		const startOfFollowingMonth    = new Date(today.getFullYear(), today.getMonth() + 2, 1);
		const toDateString             = (date) => date.toLocaleDateString("sv-SE");
		const todayStr                 = toDateString(today);
		const startOfNextMonthStr      = toDateString(startOfNextMonth);
		const startOfFollowingMonthStr = toDateString(startOfFollowingMonth);

		// 今月グループ取得
		const { data: thisMonthGroups, error: error1 } = await supabase
			.from('groups')
			.select('*')
			.gte('start_date', todayStr)
			.lt('start_date', startOfNextMonthStr)
			.order('start_date', { ascending: true });

			if (error1) {
			console.error("今月の取得エラー:", error1.message);
			return;
			}

			// 来月グループ取得
			const { data: nextMonthGroups, error: error2 } = await supabase
			.from('groups')
			.select('*')
			.gte('start_date', startOfNextMonthStr)
			.lt('start_date', startOfFollowingMonthStr)
			.order('start_date', { ascending: true });

			if (error2) {
				console.error("来月の取得エラー:", error2.message);
				return;
			}

			// おすすめ候補 = 今月 + 来月
			const allGroups = [...(thisMonthGroups || []), ...(nextMonthGroups || [])];

			// 空きがある最も早いグループを探す
			const recommendedGroup = allGroups.find(group => {
				const joinedCount = group.member?.length || 0;
				return group.member_count !== null && joinedCount < group.member_count;
			});

			// 今月・来月からおすすめを除外
			const recommendedId = recommendedGroup?.id;
			const filteredThisMonth = (thisMonthGroups || []).filter(g => g.id !== recommendedId);
			const filteredNextMonth = (nextMonthGroups || []).filter(g => g.id !== recommendedId);

			// state に保存
			setGroupData({
			thisMonth: filteredThisMonth,
			nextMonth: filteredNextMonth,
			recommend: recommendedGroup || null,
			});

			console.log("おすすめ:", recommendedGroup);
		};

		GetGroups();
	}, []);


	// 画像の最適化関数
	const optimizeImage = (url, options = {}) => {
		const { width = 480, height = 300 } = options;
		if (!url.includes('/upload/')) return url;
		const transformation = `w_${width},h_${height},c_fill,f_auto,q_auto`;
		return url.replace('/upload/', `/upload/${transformation}/`);
	};


	return (
		<div className="flex flex-col justify-start items-center w-[100%] pt-[20px] pb-[50px] overflow-y-scroll overflow-x-hidden">
			<div className="flex flex-col items-center justify-center w-[100%]">
				{groupData.recommend ? (
				<div>
					<p className="text-[18px] font-bold">おすすめ</p>
					<div
					onClick={() => setSelectPost(groupData.recommend.id)}
					className="w-[335px] h-[200px] mt-[5px] bg-cover bg-center bg-no-repeat rounded-[8px]"
					style={{ backgroundImage: `url('${optimizeImage(groupData.recommend.image_url)}')` }}

					></div>
				</div>
				) : (
				<p>現在おすすめグループはありません。</p>
				)}
			</div>

			<GroupSlider title="今月" groups={groupData.thisMonth} setSelectPost={setSelectPost}  />
			<GroupSlider title="来月" groups={groupData.nextMonth} setSelectPost={setSelectPost}/>

		</div>
	);
}
