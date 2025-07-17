'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/app/utils/supabase/supabaseClient';

export default function LoginLoading() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const handleLogin = async () => {
		if (typeof window === 'undefined') return;

		const idTokenFromSearch = searchParams.get('id_token');
		const hash = window.location.hash.substring(1);
		const hashParams = new URLSearchParams(hash);
		const idTokenFromHash = hashParams.get('id_token');
		const idToken = idTokenFromHash || idTokenFromSearch;

		console.log('ID Token:', idToken);

		if (!idToken) {
			console.error('id_token not found');
			return;
		}

		const { data, error } = await supabase.auth.signInWithIdToken({
			provider: 'dev-8niza83ncu4nqh2o.us',
			token: idToken,
		});

		if (error) {
			console.error('Supabase login error:', error);
		} else {
			console.log('Logged in!', data);
			router.push('/top');
		}
		};

		handleLogin();
	}, [router, searchParams]);

	return <div>ログイン処理中です...</div>;
}
