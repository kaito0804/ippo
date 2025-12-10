"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/utils/userContext';
import Header from "@/component/Header";

export default function EventSetting() {
  const { userProfile } = useUserContext();
  const router = useRouter();

  // Stripe Connect ボタンの処理
  const handleStripeConnect = async () => {
    try {
      const res = await fetch("/api/stripeConnectCreateAccount", {
        method: "POST",
      });
      const data = await res.json();

      if (data.url) {
        // Stripe のオンボーディング画面へ遷移
        window.location.href = data.url;
      }

    } catch (error) {
      console.error(error);
      alert("Stripe Connect のリンク作成に失敗しました");
    }
  };

  return (
    <div className="content-bg-color">
      <Header/>

      {!userProfile ? (
        <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex justify-center items-center">
          <p className="text-xl text-[#ff7a00] font-bold animate-pulse">読み込み中です...</p>
        </div>

      ) : (
        <div className="header-adjust">
          <div className='h-adjust flex flex-col justify-start items-center'>
            <p className='text-[20px] font-bold mt-[60px]'>stripe connect test</p>
            <p className='text-[12px] mt-[2px]'>※管理者専用ページ</p>

            <div className='flex flex-col justify-center items-center mt-[30px]'>
              <button
                onClick={handleStripeConnect}
                className='flex justify-center items-center w-[220px] py-[12px] bg-[#F26A21] text-[#fff] rounded-[100px] text-[16px] font-bold'
              >
                stripe connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
