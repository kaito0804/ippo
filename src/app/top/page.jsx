"use client";

//react/next.js用ライブラリ
import { useState, useEffect, use} from "react";

//データベース関連
import { supabase }         from '@/utils/supabase/supabaseClient';
import { useUserContext }   from '@/utils/userContext';
import { updateUserStatus } from '@/utils/updateUserStatus';

//コンポーネント
import Header           from "@/component/Header";
import Footer           from "@/component/Footer";
import FirstSetPrf      from "@/component/FirstSetPrf";
import HostTop          from "@/component/HostTop";
import MemberTop        from "@/component/MemberTop";
import ListDetailDialog from '@/component/ListDetailDialog';



export default function Home() {

    const { userId, isHost, nowStatus, userProfile, setNowStatus } = useUserContext();
    const [group, setGroup]               = useState("");
    const [postBtn, setPostBtn]           = useState(false);
    const [openDialog, setOpenDialog]     = useState(false);
    const [selectSearch, setSelectSearch] = useState(true);
    const [selectPost, setSelectPost]     = useState();
    
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

    const [groupData, setGroupData] = useState({ thisMonth: [], nextMonth: [] });

    useEffect(() => {
        const GetGroups = async () => {
            const today                    = new Date();
            const startOfNextMonth         = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            const startOfFollowingMonth    = new Date(today.getFullYear(), today.getMonth() + 2, 1);
            const toDateString             = (date) => date.toLocaleDateString("sv-SE");
            const todayStr                 = toDateString(today);
            const startOfNextMonthStr      = toDateString(startOfNextMonth);
            const startOfFollowingMonthStr = toDateString(startOfFollowingMonth);

            const { data: thisMonthGroups, error: error1 } = await supabase
                .from('groups')
                .select('*')
                .gte('start_date', todayStr)
                .lt('start_date', startOfNextMonthStr);

            if (error1) {
                console.error("今月分のグループ取得エラー:", error1.message);
                return;
            }

            const { data: nextMonthGroups, error: error2 } = await supabase
                .from('groups')
                .select('*')
                .gte('start_date', startOfNextMonthStr)
                .lt('start_date', startOfFollowingMonthStr);

            if (error2) {
                console.error("来月分のグループ取得エラー:", error2.message);
                return;
            }

            setGroupData({
                thisMonth: thisMonthGroups || [],
                nextMonth: nextMonthGroups || [],
            });

            console.log("今月の取得結果:", thisMonthGroups);
        };

        GetGroups();
    }, []);








    return (
        <div>
            {userProfile?.first_set ? (
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
                            <div className="flex flex-col justify-start items-center w-[100%] h-adjust">
                                <div>
                                    <p>おすすめ</p>
                                </div>

                                <div>
                                    <p>今月</p>
                                    {groupData.thisMonth.length == 0 ? (
                                        <li>今月の開催予定はありません。</li>
                                        ) : (
                                        <ul className="flex justify-center items-center gap-[20px] mt-[10px]">
                                            {groupData.thisMonth.map((group) => (
                                                <li key={group.id}>
                                                    <div className="w-[240px] h-[150px] bg-cover bg-center bg-no-repeat rounded-[10px]" style={{backgroundImage: `url('${group.image_url}')`}}></div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="mt-[20px]">
                                    <p>来月</p>
                                    {groupData.nextMonth.length == 0 ? (
                                        <li>来月の開催予定はありません。</li>
                                        ) : (
                                        <ul className="flex justify-center items-center gap-[20px]">
                                            {groupData.nextMonth.map((group) => (
                                                <li key={group.id}>
                                                    <div className="w-[240px] h-[150px] bg-cover bg-center bg-no-repeat rounded-[10px]" style={{backgroundImage: `url('${group.image_url}')`}}></div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
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
