'use client';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';
import liff from '@line/liff';

export default function AuthWatcher() {
    const [supaProfile, setSupaProfile] = useState(null); // Supabase用
    const [lineProfile, setLineProfile] = useState(null); // LINE LIFF用
    const { data: session, status }     = useSession();
    const [authChecked, setAuthChecked] = useState(false); // <- 追加
    const router     = useRouter();
    const pathname   = usePathname();
    const hasChecked = useRef(false); 

    useEffect(() => {
        const initAuth = async () => {
            try {
                //Supabase
                const { data: supaData } = await supabase.auth.getSession();
                if (supaData.session) {
                    setSupaProfile(supaData.session.user);
                }

                //LINE LIFF
                try {
                    if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    console.log('📱 LINE LIFF22:', profile.userId);
                    setLineProfile(profile);
                    return;
                    }
                } catch (err) {
                    console.error('❌ LINE LIFF 認証エラー:', err);
                }
            } catch (err) {
                console.error("❌ initAuth エラー:", err);
            } finally {
                setAuthChecked(true); // 認証チェック完了
            }
        };

        initAuth();
    }, []);


    // ページ遷移制御
    useEffect(() => {
        const profile = supaProfile || lineProfile;
        if (!profile) return;
        if (hasChecked.current) return; 

        console.log('🔑 Supabase Auth 経由でユーザー取得:', supaProfile);
        console.log('📱 LINE LIFF 経由でユーザー取得:', lineProfile);
        
        if (pathname === '/') {
            if (profile) router.push('/top');
            console.log('✅ 認証成功');
        } else {
            if (!profile) router.push('/');
            console.log('❌ 認証失敗');
        }

        if (hasChecked.current) return; 
        hasChecked.current = true;

        // ログイン成功時にlast_loginを更新
        const updateLoginTime = async () => {
            let userId, column;

            if (lineProfile?.userId) {
                // LINEログイン
                userId = lineProfile.userId;
                column = 'line_id';
            } else if (supaProfile?.id) {
                // Supabaseログイン
                userId = supaProfile.id;
                column = 'id';
            } else {
                console.error("❌ ユーザーIDを特定できません");
                return;
            }

            const { error } = await supabase
                .from('user_profiles')
                .update({ last_login: new Date().toISOString() })
                .eq(column, userId);

            if (error) {
                console.error('❌ ログイン時間更新失敗:', error.message);
            } else {
                console.log('✅ ログイン時間更新成功');
            }
        };

        if (profile) updateLoginTime();
        hasChecked.current = true;
    }, [lineProfile, supaProfile, pathname, router]);

    return null;
}
