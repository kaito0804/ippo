'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/utils/supabase/supabaseClient';
import liff from '@line/liff';

const UserContext = createContext({
    userId: null,
    isHost: false,
    nowStatus: null,
    userProfile: null,
    setNowStatus: () => {},
});

export const UserProvider = ({ children }) => {
	const { data: session }  = useSession();  // NextAuth session
	const [userId, setUserId] = useState(null);
	const [isHost, setIsHost] = useState(false);
	const [nowStatus, setNowStatus] = useState(null);
	const [userProfile, setUserProfile] = useState(null);

	useEffect(() => {
		const loadProfileById = async (id, retryCount = 0) => {
			const { data, error } = await supabase
				.from('user_profiles')
				.select('*')
				.eq('id', id)
				.single();

			if (data) {
				setUserProfile(data);
				setUserId(data.id);
				setIsHost(data.is_host || false);
				setNowStatus(data.now_status || null);
			} else if (retryCount < 3) {
				// 100ms 後に再トライ
				setTimeout(() => loadProfileById(id, retryCount + 1), 100);
			} else {
				console.error('プロフィール取得エラー:', error);
				setUserProfile(null);
			}
		};

		const loadProfileByLineId = async (lineId) => {
			const { data, error } = await supabase
				.from('user_profiles')
				.select('*')
				.eq('line_id', lineId)
				.single();

			if (data) {
				setUserProfile(data);
				setUserId(data.id);
				setIsHost(data.is_host || false);
				setNowStatus(data.now_status || null);
			} else {
				console.error('LINEプロフィール取得エラー:', error);
				setUserProfile(null);
			}
		};

		const fetchUser = async () => {
			// 1. Supabase Authからユーザー情報を取得してみる
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (user && !error) {
				console.log('🔑 Supabase Auth 経由でユーザー取得:', user.id);
				await loadProfileById(user.id);
				return;
			}

			// 2. NextAuthのsessionにlineIdがあれば、それを使ってプロフィール取得
			if (session?.user?.lineId) {
				console.log('🌐 NextAuth LINEログイン経由でユーザー取得:', session.user.lineId);
				await loadProfileByLineId(session.user.lineId);
				return;
			}

			// 3. LIFFが初期化済みかつログイン済みならLIFFでプロフィール取得
			try {
				await liff.ready;
				if (liff.isLoggedIn()) {
				const profile = await liff.getProfile();
				console.log('📱 LINE LIFF 経由でユーザー取得:', profile.userId);
				await loadProfileByLineId(profile.userId);
				return;
				}
			} catch (err) {
				console.error('❌ LINE LIFF 認証エラー:', err);
			}

			// 4. どれも該当しなければ未ログイン状態
			console.log('🚫 認証済みユーザーなし');
			setUserProfile(null);
			setUserId(null);
			setIsHost(false);
			setNowStatus(null);
		};

		fetchUser();
	}, [session]);

	return (
		<UserContext.Provider value={{ userId, isHost, nowStatus, userProfile, setNowStatus }}>
		{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => useContext(UserContext);
