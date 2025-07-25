"use client";

//react/next.js用ライブラリ
import { useState, useEffect, use} from "react";

//データベース関連
import { supabase }         from '@/utils/supabase/supabaseClient';
import { useUserContext }   from '@/utils/userContext';

//コンポーネント
import Header           from "@/component/Header";
import Footer           from "@/component/Footer";
import FirstSetPrf      from "@/component/FirstSetPrf";
import ListTop          from "@/component/ListTop";
import HostTop          from "@/component/HostTop";
import MemberTop        from "@/component/MemberTop";
import ListDetailDialog from '@/component/ListDetailDialog';



export default function Home() {

    const { userId, isHost, nowStatus, userProfile, setNowStatus } = useUserContext();
	const [postBtn, setPostBtn]           = useState(false);
	const [openDialog, setOpenDialog]     = useState(false);
	const [selectSearch, setSelectSearch] = useState(true);
	const [selectPost, setSelectPost]     = useState();
	const [groupData, setGroupData]       = useState({ thisMonth: [], nextMonth: [] });
    
    //初回登録時auth情報をuser_profilesに登録
    useEffect(() => {
        const registerUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { id, email, user_metadata } = user;
                const display_name = user_metadata?.full_name || user_metadata?.name || "No Name";

                // 既存プロフィールを確認
                const { data: existingProfile, error: selectError } = await supabase
                    .from('user_profiles')
                    .select('id')
                    .eq('id', id)
                    .single();

                if (selectError && selectError.code !== 'PGRST116') {
                    console.error("プロフィール確認エラー:", selectError.message);
                    return;
                }

                if (!existingProfile) {
                    // 登録されていなければ新規登録
                    const { error: insertError } = await supabase.from('user_profiles').insert({
                        id,
                        email,
                        display_name
                    });

                    if (insertError) {
                        console.error("プロフィール登録エラー:", insertError.message);
                    }
                }
            }
        };
        registerUserProfile();
    }, []);


    return (
        <div>
            {/* ユーザープロファイルの読み込み中表示 */}
            {userProfile === null || userProfile === undefined ? (
                <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex justify-center items-center">
					<p className="text-xl text-[#ff7a00] font-bold animate-pulse">読み込み中です...</p>
				</div>
            ) : userProfile.first_set ? (
                <div className="flex flex-col justify-center items-center w-[100%] h-adjust header-adjust">
                    <Header title="HOME"/>

                        <div className="flex justify-between items-center w-[100%] h-[50px] bg-[#fff] border-b border-[#e1e1e1]">
                            <div onClick={() => setSelectSearch("list")} className="w-[50%] h-[100%] flex justify-center items-center">リスト</div>
                            <div onClick={() => setSelectSearch("map")} className="w-[50%] h-[100%] flex justify-center items-center">マップ</div>
                        </div>

                        {selectSearch == "map" ? (
                            <div className="flex flex-col justify-center items-center w-[100%] h-adjust">
                                {isHost ? (                
                                    <HostTop setSelectPost={setSelectPost} openDialog={openDialog} setOpenDialog={setOpenDialog} setPostBtn={() => setPostBtn(true)}/>
                                ) : (
                                    <MemberTop setSelectPost={setSelectPost} openDialog={openDialog} setOpenDialog={setOpenDialog} setPostBtn={() => setPostBtn(true)}/>
                                )}
                            </div>
                        ) : (
                            <ListTop setSelectPost={setSelectPost}/>
                        )}
                  
                    <ListDetailDialog selectPost={selectPost} setSelectPost={setSelectPost}/>
                    {/*<Footer postBtn={postBtn} openDialog={() => setOpenDialog(true)}/>*/}
                </div>
            ) : (
                <FirstSetPrf />
            )}
        </div>
    );
}
