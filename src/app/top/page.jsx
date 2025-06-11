"use client";

//react/next.js用ライブラリ
import Image from "next/image";
import { useState } from "react";

//データベース関連
import { supabase } from '@/app/utils/supabase/supabaseClient';
import { useUserContext } from '@/app/utils/userContext';
import { updateUserStatus } from '@/app/utils/updateUserStatus';

//コンポーネント
import HostTop from "@/app/component/HostTop/HostTop";
import Footer from "@/app/component/Footer/Footer";



export default function Home() {

    const { userId, isHost, nowStatus, setNowStatus } = useUserContext();
    
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
        <div className="flex flex-col justify-center items-center w-[100%] h-[100vh]">
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
				<HostTop/>
            )}

			{nowStatus == 'member' && (                
				参加者
            )}
            <Footer/>
        </div>
    );
}
