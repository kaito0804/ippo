import { supabase } from './supabaseClient'

export const getUserId = async () => {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error) {
        console.error('ユーザー取得エラー:', error.message)
        return null
    }

    return user?.id || null
}
