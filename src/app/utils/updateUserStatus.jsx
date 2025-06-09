import { supabase } from '@/app/utils/supabase/supabaseClient';

export const updateUserStatus = async (userId, status) => {

    const { error } = await supabase
        .from('user_profiles')
        .update({ now_status: status })
        .eq('id', userId);

    if (error) {
        console.error('ステータス更新エラー:', error.message);
        return false;
    }

    return true;
};
