'use client';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';

export default function AuthWatcher() {
    const { data: session, status }     = useSession();
    const [supaSession, setSupaSession] = useState(null);
    const router     = useRouter();
    const pathname   = usePathname();
    const hasChecked = useRef(false); 

    // Supabase セッション監視
    useEffect(() => {
        if (hasChecked.current) return; 
       
        supabase.auth.getSession().then(({ data }) => setSupaSession(data.session));
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSupaSession(session);
        });
        return () => {
            listener.subscription.unsubscribe();
        };
        
    }, []);

    // ページ遷移制御
    useEffect(() => {
        if (status === 'loading') return;

        hasChecked.current = true;
        
        console.log('🔑 Supabase Auth 経由でユーザー取得:', supaSession);
        console.log('📱 LINE LIFF 経由でユーザー取得:', session);
        const loggedIn = session || supaSession;

        if (pathname === '/') {
            if (loggedIn) router.push('/top');
            console.log('✅ 認証成功');
        } else {
            if (!loggedIn) router.push('/');
            console.log('❌ 認証失敗');
        }

        if (hasChecked.current) return; 

        // ログイン成功時にlast_loginを更新
        const updateLoginTime = async () => {
            let userId, column;

            if (session?.user?.id) {
                userId = session.user.id;  
                column = 'line_id';
            } else if (supaSession?.user?.id) {
                userId = supaSession.user.id;
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

        updateLoginTime();
    }, [session, status, supaSession, pathname, router]);

    return null;
}
