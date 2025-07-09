// src/app/api/joinGroup/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import { getUserIdFromAccessToken } from '@/app/utils/supabase/supabaseBackend';

export async function POST(req) {
	try {
		const { groupId } = await req.json();
		const token = req.headers.get('authorization')?.replace('Bearer ', '');
		if (!token) return new Response('Unauthorized', { status: 401 });

		const userId = await getUserIdFromAccessToken(token);
		if (!userId) return new Response('Unauthorized', { status: 401 });

		if (!userId) {
			return NextResponse.json({ error: "未ログインです" }, { status: 401 });
		}

		// すでに参加済みか確認（任意）
		const { data: existing, error: existError } = await supabase
		.from("group_members")
		.select("*")
		.eq("group_id", groupId)
		.eq("user_id", userId)
		.single();

		if (existing) {
		return NextResponse.json({ message: "すでに参加済みです" });
		}

		// グループ作成者取得
		const { data: groupData, error: groupError } = await supabase
		.from("groups")
		.select("created_by")
		.eq("id", groupId)
		.single();

		if (groupError) {
		return NextResponse.json({ error: "グループ情報が取得できません" }, { status: 400 });
		}

		// 参加登録
		const { error } = await supabase.from("group_members").insert({
		group_id: groupId,
		user_id: userId,
		created_by: groupData.created_by,
		});

		if (error) {
		return NextResponse.json({ error: "参加登録に失敗しました" }, { status: 500 });
		}

		return NextResponse.json({ message: "参加登録完了" });
	} catch (e) {
		return NextResponse.json({ error: "不明なエラー" }, { status: 500 });
	}
}
