"use client";

//react/next.js用ライブラリ
import { useState, useEffect} from "react";

//データベース関連
import { supabase }         from '@/app/utils/supabase/supabaseClient';
import { useUserContext }   from '@/app/utils/userContext';
import { updateUserStatus } from '@/app/utils/updateUserStatus';

//コンポーネント
import Header  from "@/app/component/Header/Header";
import Footer  from "@/app/component/Footer/Footer";
import HostTop from "@/app/component/HostTop/HostTop";



export default function Home() {

    const { userId, isHost, nowStatus, setNowStatus } = useUserContext();
    const [postBtn, setPostBtn]                       = useState(false);
    const [openDialog, setOpenDialog]                 = useState(false);
    
    useEffect(() => {
        const registerUserProfile = async () => {
          const { data: { user } } = await supabase.auth.getUser();
    
          if (user) {
            const { id, email, user_metadata } = user;
            const display_name = user_metadata?.full_name || user_metadata?.name || "No Name";
    
            // user_profiles に upsert
            const { error } = await supabase.from('user_profiles').upsert({
              id,
              email,
              display_name
            });
    
            if (error) {
              console.error("プロフィール登録エラー:", error.message);
            }
          }
        };
    
        registerUserProfile();
      }, []);

    const handleClickHost =  async (status) => {
        if (!isHost && status === 'host') {
            alert('主催者のみ操作できます');
            return;
        }

        const success = await updateUserStatus(userId, status);
        if (success) {
            setNowStatus(status);
            alert(`${status} に更新しました`);
        }
    };

    return (
        <div>

            <Header title="HOME"/>

            <div className="flex flex-col justify-center items-center w-[100%] h-adjust header-adjust">
                {!nowStatus && (
                    <div className="flex items-center justify-center gap-[50px]">
                        <div onClick={() => handleClickHost('host')} className="flex flex-col items-center justify-center w-[120px] h-[120px] bg-[#459fff] rounded-[10px] text-white">
                            主催者
                        </div>
                        <div onClick={() => handleClickHost('member')} className="flex flex-col items-center justify-center w-[120px] h-[120px] bg-[#ff9c45] rounded-[10px] text-white">
                            参加者
                        </div>
                    </div>
                )}

                {nowStatus == 'host' && (                
                    <HostTop openDialog={openDialog} setOpenDialog={setOpenDialog} setPostBtn={() => setPostBtn(true)}/>
                )}

                {nowStatus == 'member' && (                
                    <p>参加者</p>
                )}
            </div>

            <Footer postBtn={postBtn} openDialog={() => setOpenDialog(true)}/>

        </div>
    );
}
