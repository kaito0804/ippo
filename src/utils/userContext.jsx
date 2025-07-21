'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/supabaseClient';
import liff from '@line/liff';

const UserContext = createContext({
  userId: null,
  isHost: false,
  nowStatus: null,
  setNowStatus: () => {},
});

export const UserProvider = ({ children }) => {
	const [userId, setUserId] = useState(null);
	const [isHost, setIsHost] = useState(false);
	const [nowStatus, setNowStatus] = useState(null);

	useEffect(() => {
		const fetchSupabaseUser = async () => {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (!user || error) {
				// SupabaseログインしていなければLINE認証も試すが、
				// どちらもなければ何もしない（処理終了）
				console.log('⚠️ Supabase未ログイン、LINE認証を試みます');
				await fetchLineUser();
				return;
			}

			if (user && !error) {
				console.log('🔑 Supabase Auth 経由でユーザー取得:', user.id);
				setUserId(user.id);

				const { data } = await supabase
				.from('user_profiles')
				.select('is_host, now_status')
				.eq('id', user.id)
				.single();

				if (data) {
				setIsHost(data.is_host || false);
				setNowStatus(data.now_status || null);
				}
			} else {
				console.log('⚠️ Supabase Auth でユーザー取得できず、LINE認証にフォールバックします');
				fetchLineUser();
			}
		};

		const fetchLineUser = async () => {
			try {
				await liff.ready;
				if (!liff.isLoggedIn()) {
				console.log('⚠️ LINE未ログインのため処理を中止');
				return;  // LINEも未ログインならここで終了
				}

				const profile = await liff.getProfile();

				if (profile?.userId) {
				console.log('📱 LINE LIFF 経由でユーザー取得:', profile.userId);

				const { data } = await supabase
					.from('user_profiles')
					.select('id, is_host, now_status')
					.eq('line_id', profile.userId)
					.single();

				if (data) {
					setIsHost(data.is_host || false);
					setNowStatus(data.now_status || null);
					setUserId(data.id);
				}
				} else {
				console.log('⚠️ LINE プロフィール取得失敗');
				}
			} catch (err) {
				console.error('❌ LINE認証エラー:', err);
			}
		};

		fetchSupabaseUser();
	}, []);


  return (
    <UserContext.Provider value={{ userId, isHost, nowStatus, setNowStatus }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
