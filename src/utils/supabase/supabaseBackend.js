// src/utils/supabase/supabeseBackend.js
import { supabase } from './supabaseServer';

export async function getUserIdFromAccessToken(access_token) {
	const { data: { user }, error } = await supabase.auth.getUser(access_token);
	if (error) {
		console.error('ユーザー取得エラー:', error.message);
		return null;
	}
	return user?.id || null;
}
