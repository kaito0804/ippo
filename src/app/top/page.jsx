"use client";

//react/next.js用ライブラリ
import { useState, useEffect, use} from "react";

//データベース関連
import { supabase }         from '@/utils/supabase/supabaseClient';
import { useUserContext }   from '@/utils/userContext';

//コンポーネント
import Header           from "@/component/Header";
import FirstSetPrf      from "@/component/FirstSetPrf";
import ListTop          from "@/component/ListTop";


export default function Top() {

    const { userProfile, loading } = useUserContext();
    
    //初回登録時auth情報をuser_profilesに登録
    useEffect(() => {
        if (userProfile) return;
        
        const registerUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { id, email, user_metadata } = user;
                const display_name = user_metadata?.full_name || user_metadata?.name || "No Name";

                // 既存プロフィールを確認
                const { data: existingProfile, error: selectError } = await supabase
                    .from('user_profiles')
                    .select('id')
                    .eq('id', id)
                    .single();

                if (selectError && selectError.code !== 'PGRST116') {
                    console.error("プロフィール確認エラー:", selectError.message);
                    return;
                }

                if (!existingProfile) {
                    // 登録されていなければ新規登録
                    const { error: insertError } = await supabase.from('user_profiles').insert({
                        id,
                        email,
                        display_name
                    });

                    if (insertError) {
                        console.error("プロフィール登録エラー:", insertError.message);
                    }
                }
            }
        };
        console.log("初回登録時auth情報をuser_profilesに登録");
        registerUserProfile();
    }, []);


    return (
        <div>
            {/* ユーザープロファイルの読み込み中表示 */}
            {loading ? (
                <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex justify-center items-center">
					<p className="text-xl text-[#ff7a00] font-bold animate-pulse">読み込み中です...</p>
				</div>
            ) : userProfile.first_set ? (
                <div className="flex flex-col justify-center items-center w-[100%] header-adjust h-adjust">
                    <Header title="HOME"/>

                    <ListTop/>
                  
                </div>
            ) : (
                <FirstSetPrf />
            )}
        </div>
    );
}
