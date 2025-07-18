"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/app/component/Line/Line';
import { signIn } from 'next-auth/react';
import { supabase } from "@/app/utils/supabase/supabaseClient";

export default function AuthButtons({ user }) {
	const router = useRouter();
	const { isInitialized, isLoggedIn, liffObject, getIdToken } = useLiff();
	const [authBtn, setAuthBtn] = useState('');
	const [authError, setAuthError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState('');
	
	 useEffect(() => {
		// LIFF初期化中または未ログインの場合は何もしない
		if (!isInitialized) return;

		// LINEにログイン済みの場合はIDトークンを取得してサインイン
		const handleSignIn = async () => {
			try {
				setIsLoading(true);
				setAuthError(null);

				// IDトークンを取得
				const idToken = await getIdToken();
				if (!idToken) {
				setAuthError('IDトークンの取得に失敗しました');
				return;
				}

				// Auth.jsでサインイン
				const result = await signIn('liff', {
				idToken,
				redirect: false,
				});

				if (result?.error) {
				setAuthError(result.error);
				} else if (result?.url) {
				// 認証成功時はリダイレクト
				router.push(result.url);
				}
			} catch (err) {
				setAuthError('認証中にエラーが発生しました');
				console.error('認証エラー:', err);
			} finally {
				setIsLoading(false);
			}
		};

		// 自動サインイン実行
		handleSignIn();
	}, [isInitialized, isLoggedIn, liffObject, getIdToken, router]);

	const LineLogin = async () => {
		// LINEにログインしていない場合はLINEログインを実行
		if (!isLoggedIn && liffObject) {
			liffObject.login({ redirectUri: window.location.href });
			return;
		}else{
			try {
				setIsLoading(true);
				setAuthError(null);

				// IDトークンを取得
				const idToken = await getIdToken();
				if (!idToken) {
				setAuthError('IDトークンの取得に失敗しました');
				return;
				}

				// Auth.jsでサインイン
				const result = await signIn('liff', {
				idToken,
				redirect: false,
				});

				if (result?.error) {
				setAuthError(result.error);
				} else if (result?.url) {
					requestAnimationFrame(() => {
						router.push(result.url);
					});
					return;
				}

			} catch (err) {
				setAuthError('認証中にエラーが発生しました');
				console.error('認証エラー:', err);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const redirectTo =
		process.env.NODE_ENV === 'development'
			? 'http://localhost:3000/top'
			: 'https://ippo-sampo.vercel.app/top';

	const signInWithGoogle = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo
			}
		});
	};

	// LINEログイン開始
	const signInWithLine2 = () => {
		const auth0Domain = "dev-8niza83ncu4nqh2o.us.auth0.com";
		const clientId    = "StmPak8MbLNz7PBJqS17BX6hfmckddXS";
		const redirectUri = process.env.NEXT_PUBLIC_APP_URL + "/login_loading" || "https://ippo-sampo.vercel.app/login_loading";

		// response_type を "id_token token" に変更
		const url = `https://${auth0Domain}/authorize?response_type=id_token%20token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&connection=line&scope=profile openid email&nonce=${Date.now()}`;
		console.log('Auth0 URL:', url);
		window.location.href = url;
	};



	return (
		<div onClick={() => setAuthBtn('')} className="flex flex-col justify-center items-center">
			{isLoading && (
				<div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex justify-center items-center">
					<p className="text-xl text-[#ff7a00] font-bold animate-pulse">ログイン処理中です...</p>
				</div>
			)}

			<div className="flex flex-col justify-center items-center w-[100%] h-[100dvh] bg-[#fffcfa]">
				<div className="absolute top-[calc(50%-120px)] flex flex-col justify-center items-center text-[#ff7a00]">
					<p className="font-bold text-[60px]">IPPO</p>
					<p className="font-bold text-[18px]">散歩コミュニティ</p>
				</div>
			</div>	
			
			<div onClick={(e) => e.stopPropagation()} className={`${authBtn ? 'bottom-[-100%]' : 'bottom-[80px]'} absolute flex flex-col justify-center items-center gap-[30px] transition-all duration-500`}>
				<div onClick={() => setAuthBtn('login')} className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#4363ff] text-white rounded-[100px] font-bold">ログイン</div>
				<div onClick={() => setAuthBtn('new_reg')} className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#ff9731] text-white rounded-[100px] font-bold">新規アカウント作成</div>
			</div>

			<div className={`${authBtn ? 'bottom-0' : '-bottom-full'} absolute flex flex-col justify-center items-center gap-[30px] w-[100%] py-[35px] bg-[rgba(51,51,51,0.8)] rounded-t-[20px] transition-all duration-500`}>
				<div onClick={signInWithGoogle} className="btn-icon-google relative w-[300px] py-[12px] pl-[13px] flex flex-col justify-center items-center bg-[#fff] text-[#333] rounded-[100px] font-bold">
					Googleで{authBtn == 'new_reg' ? '登録' : 'ログイン'}
				</div>

				{/* LIFF初期化待ち */}
				{!isInitialized && !authError && (
				<p className="text-center text-gray-600">LINEと通信中...</p>
				)}

				<div onClick={LineLogin} className="btn-icon-line relative w-[300px] py-[12px] pl-[13px] flex flex-col justify-center items-center bg-[#06C755] text-white rounded-[100px] font-bold">
					LINEで{authBtn == 'new_reg' ? '登録' : 'ログイン'}
				</div>
			</div>
		</div>
		
	);
}
