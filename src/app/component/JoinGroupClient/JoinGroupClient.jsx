"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function JoinGroupClient({ groupId }) {
  const [status, setStatus] = useState("参加登録中...");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function joinGroup() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setStatus("未ログインです。");
        return;
      }

      const token = session.access_token;

      try {
        const res = await fetch("/api/joinGroup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ groupId }),
        });

        if (res.ok) {
          setStatus("参加登録が完了しました！");
        } else {
          const { error, message } = await res.json();
          setStatus(error || message || "参加登録に失敗しました。");
        }
      } catch {
        setStatus("エラーが発生しました。");
      }
    }

    joinGroup();
  }, [groupId]);

  return <p>{status}</p>;
}
