// src/lib/addUserToGroup.js
import { supabase } from '@/utils/supabase/supabaseClient';

export async function addUserToGroup(userId, groupId) {
  if (!userId || !groupId) return false;

  // すでに参加しているか確認
  const { data: existingMember, error: checkError } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('参加確認エラー:', checkError);
    return false;
  }

  if (existingMember) {
    // すでに参加している
    return true;
  }

  // groupsテーブルの created_by を取得
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('created_by, member')
    .eq('id', groupId)
    .single();

  if (groupError) {
    console.error('グループ取得エラー:', groupError);
    return false;
  }

  // group_members に追加
  const { error: insertError } = await supabase.from('group_members').insert({
    group_id: groupId,
	group_name: group.name,
    user_id: userId,
    created_by: group.created_by,
  });

  if (insertError) {
    console.error('group_members 追加エラー:', insertError);
    return false;
  }

  // groups.member 配列にも追加（古い仕様との互換性）
  const updatedMembers = group.member ? [...group.member, userId] : [userId];
  const { error: updateError } = await supabase
    .from('groups')
    .update({ member: updatedMembers })
    .eq('id', groupId);

  if (updateError) {
    console.error('groups.member 更新エラー:', updateError);
    return false;
  }

  return true;
}
