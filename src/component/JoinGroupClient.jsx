import { supabase } from '@/utils/supabaseClient';

export async function addUserToGroup(userId, groupId) {
  if (!userId || !groupId) return false;

  //現在のメンバー配列を取得
  const { data: group, error } = await supabase
    .from('groups')
    .select('member')
    .eq('id', groupId)
    .single();

  if (error) {
    console.error('グループ取得エラー:', error);
    return false;
  }

  // すでにメンバーに含まれていれば何もしない
  if (group.member && group.member.includes(userId)) {
    return true;
  }

  // 配列にuserIdを追加
  const updatedMembers = group.member ? [...group.member, userId] : [userId];

  const { error: updateError } = await supabase
    .from('groups')
    .update({ member: updatedMembers })
    .eq('id', groupId);

  if (updateError) {
    console.error('グループメンバー更新エラー:', updateError);
    return false;
  }
  return true;
}
