// @/app/login_loading/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/app/utils/supabase/supabaseClient';

export default function CallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const handleLogin = async () => {
			if (typeof window === 'undefined') return;

			try {
				// Next.jsのuseSearchParamsからクエリパラメータを取得
				const idTokenFromSearch = searchParams.get('id_token');
				
				// URLフラグメントからも取得を試行
				const hash = window.location.hash.substring(1);
				const hashParams = new URLSearchParams(hash);
				const idTokenFromHash = hashParams.get('id_token');
				
				const idToken = idTokenFromHash || idTokenFromSearch;
				
				console.log('ID Token from hash:', idTokenFromHash);
				console.log('ID Token from search:', idTokenFromSearch);
				console.log('Final ID Token:', idToken);

				if (!idToken) {
					console.error("id_token not found");
					console.log('Hash:', hash);
					console.log('Search params:', Object.fromEntries(searchParams));
					return;
				}

				const { data, error } = await supabase.auth.signInWithIdToken({
					provider: 'dev-8niza83ncu4nqh2o.us',
					token: idToken,
				});

				if (error) {
					console.error("Supabase login error:", error);
				} else {
					console.log("Logged in!", data);
					router.push('/top');
				}
			} catch (error) {
				console.error('Error in handleLogin:', error);
			}
		};

		handleLogin();
	}, [router, searchParams]);

	return <div>ログイン処理中です...</div>;
}