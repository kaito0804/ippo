// utils/stripe/stripeClick.jsx
import { useState } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { handleStripeJoin } from "@/utils/stripe/stripeClient"; 

export const stripeClick = (userId) => {
	const [joiningStatus, setJoiningStatus]       = useState({});
	const [userJoinedGroups, setUserJoinedGroups] = useState(new Set());
	const [memberCounts, setMemberCounts]         = useState({});

	const onStripeClick = async (group) => {
		if (!userId) {
			alert("ログインが必要です");
			return;
		}

		// Stripe決済が必要な場合
		if (group.price !== "free") {
			try {
				await handleStripeJoin(group);
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
			alert("グループ情報の取得に失敗しました。\n" + groupError.message);
			setJoiningStatus((prev) => ({ ...prev, [group.id]: false }));
			return;
		}

		const { error } = await supabase.from("group_members").insert({
			group_id: group.id,
			user_id: userId,
			created_by: groupData.created_by,
		});

		if (error) {
			if (error.code === "23505") {
				alert("すでに参加しています。");
			} else {
				alert("参加に失敗しました。\n" + error.message);
				console.log(error.message);
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

	return {
		joiningStatus,
		userJoinedGroups,
		memberCounts,
		onStripeClick,
	};
};
