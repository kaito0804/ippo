'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';

export default function AuthWatcher() {
    const { data: session, status }     = useSession();
    const [supaSession, setSupaSession] = useState(null);
    const router   = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSupaSession(data.session));

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSupaSession(session);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (status === 'loading') return;

        console.log('🔑 Supabase Auth 経由でユーザー取得:', supaSession);
        console.log('📱 LINE LIFF 経由でユーザー取得:', session);
        const loggedIn = session || supaSession;

        // ログインページ
        if (pathname === '/') {
            if (loggedIn) {
                router.push('/top');
            }
            // 未ログインならそのままログインページにいる
            return;
        }else{
            if (!loggedIn) {
                router.push('/');
            }
            return;
        }

    }, [session, status, supaSession, pathname, router]);

    return null;
}
