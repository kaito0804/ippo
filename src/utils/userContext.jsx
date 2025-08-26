'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/utils/supabase/supabaseClient';
import liff from '@line/liff';

const UserContext = createContext({
	userProfile: null,
	setUserProfile: () => {}, 
	setNowStatus: () => {},
});

export const UserProvider = ({ children }) => {
	const { data: session } = useSession();
	const [userProfile, setUserProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	const setNowStatus = (status) => {
		setUserProfile(prev => prev ? { ...prev, now_status: status } : prev);
	};

  	useEffect(() => {
		if (userProfile) return;

		const loadProfileById = async (id) => {
			const { data, error } = await supabase
				.from('user_profiles')
				.select('*')
				.eq('id', id)
				.single();

			if (data) setUserProfile(data);
			else console.error('プロフィール取得エラー:', error);
		};

		const loadProfileByLineId = async (lineId) => {
			const { data, error } = await supabase
				.from("user_profiles")
				.select("*")
				.eq("line_id", lineId)
				.single();

			if (data) {
					setUserProfile(data);
			} else if (error && error.code !== "PGRST116") {
				console.error("LINEプロフィール取得エラー:", error);
				try {
				liff.logout();
				localStorage.clear();
				sessionStorage.clear();
				setUserProfile(null); 
				} catch (e) {
				console.error("LIFF セッション削除エラー:", e);
				}
			} else {
				console.log("新規ユーザーのため、Supabaseには未登録");
				setUserProfile(null);
			}
		};

		const fetchUser = async () => {
			setLoading(true); 

			// 1. Supabase Auth
			const { data: { user }, error } = await supabase.auth.getUser();
			if (user && !error) {
				console.log('🔑 Supabase Auth:', user.id);
				await loadProfileById(user.id);
				setLoading(false);
				return;
			}

			// 2. NextAuth session LINEログイン
			if (session?.user?.lineId) {
				console.log('🌐 NextAuth LINEログイン:', session.user.lineId);
				await loadProfileByLineId(session.user.lineId);
				setLoading(false)
				return;
			}

			// 3. LIFF
			try {
				if (liff.isLoggedIn()) {
				const profile = await liff.getProfile();
				console.log('📱 LINE LIFF:', profile.userId);
				await loadProfileByLineId(profile.userId);
				setLoading(false);
				return;
				}
			} catch (err) {
				console.error('❌ LINE LIFF 認証エラー:', err);
			}

			// 4. 未ログイン
			console.log('🚫 認証済みユーザーなし');
			setUserProfile(null);
			setLoading(false);
		};

		fetchUser();
	}, [session, userProfile]);

  	const value = useMemo(() => ({
		userProfile,
		setUserProfile, 
		setNowStatus,
		loading
	}), [userProfile, loading]);

	return (
		<UserContext.Provider value={value}>
		{children}
		</UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
