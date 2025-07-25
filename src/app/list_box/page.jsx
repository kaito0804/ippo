"use client";

//react/next.js用ライブラリ
import { useEffect, useState } from "react";

//データベース関連
import { supabase } from "@/utils/supabase/supabaseClient";
import { handleStripeJoin } from "@/utils/stripe/stripeClient"; 

//クライアントコンポーネント
import Header from "@/component/Header";
import { useUserContext } from '@/utils/userContext';
import SearchListDialog from "@/component/SearchListDialog";
import ListDetailDialog from '@/component/ListDetailDialog';

export default function ListBox() {

 	const { userId, isHost, nowStatus }           = useUserContext();
	const [joiningStatus, setJoiningStatus]       = useState({}); 
	const [filters, setFilters]                   = useState({area: null,theme: null,});
	const [dropdowns, setDropdowns]               = useState({area: false,theme: false,});
	const [groups, setGroups]                     = useState([]);
	const [memberCounts, setMemberCounts]         = useState({});
	const [selectPost, setSelectPost]             = useState();
	const [userJoinedGroups, setUserJoinedGroups] = useState(new Set());
	const formatDate                              = (dateStr) => dateStr?.replace(/-/g, '/');
	console.log(nowStatus)

	useEffect(() => {
		if (!userId) return;

		async function fetchGroups() {
			const { data, error } = await supabase
			.from('groups')
			.select('*')
			.order('created_at', { ascending: false });

			if (error) {
			console.error("グループ取得エラー:", error);
			return;
			}

			if (data) {
			setGroups(data);

			// 自分が参加しているグループIDを抽出
			const joinedGroupIds = data
				.filter(group => group.member?.includes(userId))
				.map(group => group.id);

			setUserJoinedGroups(new Set(joinedGroupIds));
			}
		}

		fetchGroups();
	}, [userId]);



	const handleJoin = async (group) => {
		if (!userId) {
			alert("ログインが必要です");
			return;
		}

		// Stripe 決済が必要な場合
		if (group.price !== "free") {
			try {
				await handleStripeJoin(group); // Stripe Checkout へ遷移
			} catch (e) {
				console.error("Stripe決済エラー:", e);
				alert("決済処理に失敗しました");
			}
			return;
		}

		// === 無料参加処理 ===
		setJoiningStatus((prev) => ({ ...prev, [group.id]: true }));

		try {
			const { data: groupData, error: groupError } = await supabase
			.from("groups")
			.select("created_by")
			.eq("id", group.id)
			.single();

			if (groupError) {
				alert("グループ情報の取得に失敗しました。");
				setJoiningStatus((prev) => ({ ...prev, [group.id]: false }));
				return;
			}

			const { error } = await supabase.from("group_members").insert({
				group_id   : group.id,
				user_id    : userId,
				created_by : groupData.created_by,
			});

			if (error) {
				if (error.code === "23505") {
					alert("すでに参加しています。");
				} else {
					alert("参加に失敗しました。");
				}
			} else {
				alert("グループに参加しました！");
				setUserJoinedGroups((prev) => new Set(prev).add(group.id));
				setMemberCounts((prev) => ({
					...prev,
					[group.id]: (prev[group.id] || 0) + 1,
				}));
			}
		} finally {
			setJoiningStatus((prev) => ({ ...prev, [group.id]: false }));
		}
	};


	return (
		<div className="content-bg-color">
			<Header title={'散歩コース一覧'}/>
			<div className="header-adjust">

				<SearchListDialog filters={filters} setFilters={setFilters} dropdowns={dropdowns} setDropdowns={setDropdowns}/>

				<ul className="flex flex-col w-[100%] h-adjust pt-[47px] pb-[120px] px-[20px] gap-[50px] overflow-y-scroll">
					{groups
					.filter((group) => {
						const areaMatch  = !filters.area || group.area === filters.area;
						const themeMatch = !filters.theme || group.theme?.includes(filters.theme);;
						return areaMatch && themeMatch;
					})
					.map((group) => (
						<li key={group.id} className="w-[100%] shadow-lg rounded-[8px]">
							<div style={{ backgroundImage: `url(${group.image_url})`,backgroundSize: 'cover',backgroundPosition: 'center', backgroundRepeat: 'no-repeat', width: '100%',height: '440px', borderRadius: '8px 8px 0 0',}}></div>
							<div className="relative py-[10px] px-[15px]">
								<p className="text-[15px] font-bold">{group.name}</p>
								<div className="flex items-center gap-[14px] mt-[8px]">
									<p className="date-icon-text flex items-center text-[12px] text-[#888]">{group.start_date === group.end_date ? formatDate(group.start_date) : `${formatDate(group.start_date)} ~ ${formatDate(group.end_date)}`}</p>
									<p className="time-icon-text flex items-center text-[12px] text-[#888]">{group.start_time.slice(0, 5)} ~ {group.end_time.slice(0, 5)}</p>
								</div>
								<p className="locate-icon-text flex items-center text-[12px] text-[#888] mt-[8px]">{group.venue}</p>
								<div dangerouslySetInnerHTML={{ __html: group.description || '説明文がありません' }} className="text-[14px] text-[#333] mt-[8px]" />
								{group.member?.includes(userId) ? (
									<div className="inline-flex justify-center align-center mt-[10px] py-[4px] px-[12px] bg-[#ff922c] text-white rounded-[4px] text-[13px] font-bold">
										<p>参加中 : { group.member?.length || 0}人 / {group.member_count}人</p>
									</div>
								) : group.member?.length >= group.member_count ? (
									<div className="inline-flex justify-center align-center mt-[10px] py-[4px] px-[12px] bg-[#999] text-white rounded-[4px] text-[13px] font-bold">
										<p>満員御礼</p>
									</div>
								) : (
									<div onClick={() => handleJoin(group)} className="inline-flex justify-center align-center mt-[10px] py-[4px] px-[12px] bg-[#3B82F6] text-white rounded-[4px] text-[13px] font-bold">
										<p>参加する : {group.price}{group.price !== 'free' ? '円' : ''}</p>
									</div>
								)}
								<div onClick={() => setSelectPost(group.id)} className="list-detail-link">詳細はこちら</div>
							</div>
						</li>
					))}
				</ul>

			</div>

			<ListDetailDialog selectPost={selectPost} setSelectPost={setSelectPost}/>

		</div>
	);
}
