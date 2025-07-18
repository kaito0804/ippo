"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import { signOut as nextAuthSignOut, useSession } from "next-auth/react";
import { useLiff } from '@/app/component/Line/Line'; 
import Link from 'next/link';

export default function Header({title}) {

	const { data: nextAuthSession } = useSession();
	const router = useRouter();
	const { liff, isInitialized } = useLiff();

	const Logout = async () => {
  try {
    // NextAuth セッションがあればログアウト
    if (nextAuthSession?.user) {
      await nextAuthSignOut({ redirect: false });
    }

    // Supabase セッションがあればログアウト
    const { data: { session: supaSession } } = await supabase.auth.getSession();
    if (supaSession) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase ログアウト失敗", error);
      }
    }

    // LIFFの登録状態を初回ログイン前の状態にリセット
    if (liff && liff.isLoggedIn()) {
      await liff.logout();
    }

    // LIFF関連のlocalStorageデータを完全に削除して初期状態に戻す
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('LIFF_STORE:') || key.startsWith('nextauth.')) {
        localStorage.removeItem(key);
        console.log(`Removed: ${key}`);
      }
    });

    // セッションストレージもクリア（念のため）
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('LIFF_STORE:') || key.startsWith('nextauth.')) {
        sessionStorage.removeItem(key);
        console.log(`Removed from session: ${key}`);
      }
    });

    // Cookieも削除してLINE認証状態を完全にリセット
    const cookiesToRemove = [
      'LIFF_STORE:expires:2007726384-QVlbYlJG',
      '__Secure-next-auth.session-token',
      'next-auth.session-token',
      '__Secure-next-auth.callback-url',
      'next-auth.callback-url',
      '__Secure-next-auth.csrf-token',
      'next-auth.csrf-token'
    ];

    // 指定されたcookieを削除
    cookiesToRemove.forEach(cookieName => {
      // 複数のパスとドメインで削除を試行
      const domains = [window.location.hostname, `.${window.location.hostname}`, ''];
      const paths = ['/', '', '/auth'];
      
      domains.forEach(domain => {
        paths.forEach(path => {
          // 通常の削除
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
          // セキュアcookieの削除
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; secure;`;
          // SameSite設定も含めて削除
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; secure; samesite=lax;`;
        });
      });
      console.log(`Removed cookie: ${cookieName}`);
    });

    // 動的にLIFF関連のcookieも削除
    const allCookies = document.cookie.split(';');
    allCookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('LIFF_STORE:') || cookieName.includes('next-auth')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`;
        console.log(`Removed dynamic cookie: ${cookieName}`);
      }
    });

    // アプリケーション状態をリセット（必要に応じて追加）
    // - React状態のリセット
    // - コンテキストの初期化
    // - LIFFの再初期化フラグ設定など
    
    // 例: LIFFの再初期化が必要な場合
    if (window.liff) {
      window.liff = null; // LIFFオブジェクトをクリア
    }

    // 完全なページリロードで確実にリセット
    window.location.href = '/';
    
  } catch (error) {
    console.error('ログアウト処理中のエラー:', error);
    alert('ログアウトに失敗しました');
    // エラーが発生した場合でも強制リロード
    window.location.href = '/';
  }
};

	return (
		<div className='fixed top-0 left-0 w-[100%] z-50'>
			<div className='flex justify-between items-center w-[100%] py-[9px] px-[15px] bg-white border-b border-[#ebebeb]'>
				<Link href="/top" className='flex items-baseline gap-[8px]'>
					<div className='text-[#ff7a00] text-[30px] font-bold font-poppins leading-[1]'>IPPO</div>
				</Link>
				<div className='flex flex-col justify-center items-center'>
					<p onClick={Logout} className='logout'></p>
					<p className='text-[9px]'>ログアウト</p>
				</div>
            </div>
			{title && (
				<div className='flex items-center w-[100%] py-[8px] px-[15px] bg-[rgba(255,148,49,0.8)] text-white'>
					<p className='text-[14px] font-bold'>{title}</p>
				</div>
			)}
		</div>
	);
}
