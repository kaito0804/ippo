'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/app/utils/supabase/supabaseClient';

export default function AuthWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // もしログイン済み かつ 今がログイン画面なら /top に飛ばす
      if (session && pathname === '/') {
        router.push('/top');
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && pathname === '/') {
        router.push('/top');
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router, pathname]);

  return null;
}
