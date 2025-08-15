// /app/api/finished-group-members/route.js
/*===================================

以前一緒になったことのあるユーザーを取得

====================================*/
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseServer";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    try {
        const { data, error } = await supabase.rpc("get_my_finished_group_members", {
        p_user_id: userId
        });

        if (error) {
        console.error("RPC error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] });
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
