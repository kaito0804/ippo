"use client";
import { supabase } from "@/app/utils/supabase/supabaseClient";

export default function AuthButtons() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const signInWithApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });
  };

  const signInWithEmail = async () => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'your@example.com', // ← 入力フォームから取得するように
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button onClick={signInWithGoogle}>Googleでログイン</button>
      <button onClick={signInWithApple}>Appleでログイン</button>
      <button onClick={signInWithEmail}>メールでログインリンクを送る</button>
    </div>
  );
}
