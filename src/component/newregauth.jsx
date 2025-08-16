"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/component/Line';
import { signIn } from 'next-auth/react';
import { supabase } from "@/utils/supabase/supabaseClient";
import {groupListTemplate} from '@/utils/data/groupList';


export default function AuthButtons({ user }) {
	const router = useRouter();
	const { isInitialized, isLoggedIn, liffObject, getIdToken } = useLiff();
	const [showBtn, setShowBtn]             = useState('');
	const [regKind, setRegKind]             = useState('');
	const [rulesScrolled, setRulesScrolled] = useState(false);
	const [authError, setAuthError]         = useState(null);
	const [isLoading, setIsLoading]         = useState(false);
	
	const contentRef = useRef(null);

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


	//スクロールイベントを監視してルール同意ボタンの状態を更新
	useEffect(() => {
		const el = contentRef.current;
		if (el) {
			el.addEventListener("scroll", RulesScrolled);
		}
		return () => {
			if (el) el.removeEventListener("scroll", RulesScrolled);
		};
	}, [regKind]);


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


	const GoogleLogin = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/top',
			}
		});
	};


	const authKind = () => {
		if (regKind == 'line') {
			LineLogin();
		} else if (regKind == 'google') {
			GoogleLogin();
		}
	};


	const RulesScrolled = () => {
		const e = contentRef.current;
		if (!e) return;

		const isBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 10;
		if (isBottom !== rulesScrolled) {
			setRulesScrolled(isBottom);
		}
	};


	return (
		<div className="font-zen-maru-gothic w-[100%] h-[calc(var(--vh)_*100)] py-[30px] bg-[#FEFAF1] overflow-y-scroll">
			{isLoading && (
				<div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex justify-center items-center">
					<p className="text-xl text-[#ff7a00] font-bold animate-pulse">ログイン処理中です...</p>
				</div>
			)}
			
			{!regKind ? (
				<div className="w-[100%]">
					<div className='flex justify-between items-center w-[100%]'>
						<div onClick={() => setShowBtn('')} className='ippo_icon_n'></div>
					</div>
					{!showBtn ? (
						<div className="flex flex-col justify-center items-center w-[100%] mt-[50px]">
							<div className="flex flex-col justify-center items-left text-[#ff7a00] ">
								<p className="font-bold text-[52px]">一緒に</p>
								<p className="font-bold text-[52px] flex items-center justify-between icon-camel">散歩</p>
								<p className="font-bold text-[52px]">しようよ</p>
							</div>
							<div onClick={() =>setShowBtn('newreg')} className='w-[270px] flex justify-center items-center mt-[60px] py-[12px] bg-[#f26a21] rounded-[100px] text-white text-[20px] font-bold'>はじめる</div>
							<div onClick={() =>setShowBtn('login')} className='w-[270px] flex justify-center items-center mt-[24px] py-[12px] bg-[#fff] border border-[#f26a21] rounded-[100px] text-[#f26a21] text-[20px] font-bold'>ログイン</div>
						</div>	
					) : (
						<div className="flex flex-col justify-start items-center w-[100%] mt-[50px]">
							<p className='text-[#ff7a00] font-bold text-[32px]'>会員登録</p>

							{showBtn == 'newreg' ? (
								<div className="flex flex-col justify-center items-center w-[100%]">
									<div onClick={() =>setRegKind('line')} className="w-[295px] flex justify-center items-center mt-[50px] py-[12px] bg-[#fff] border border-[#f26a21] rounded-[100px] text-[#f26a21] text-[24px] font-bold">
										LINEで登録
									</div>

									<div onClick={() =>setRegKind('google')} className="w-[295px] flex justify-center items-center mt-[18px] py-[12px] bg-[#fff] border border-[#f26a21] rounded-[100px] text-[#f26a21] text-[24px] font-bold">
										Googleで登録
									</div>
									<p onClick={() =>setShowBtn('login')} className='border-b border-[#606060] text-[#606060] text-[20px] font-bold mt-[18px]'>ログインはこちら</p>
								</div>
							) : (
								<div className="flex flex-col justify-center items-center w-[100%]">
									<div onClick={LineLogin} className="w-[295px] flex justify-center items-center mt-[50px] py-[12px] bg-[#fff] border border-[#f26a21] rounded-[100px] text-[#f26a21] text-[24px] font-bold">
										LINEでログイン
									</div>

									<div onClick={GoogleLogin} className="w-[295px] flex justify-center items-center mt-[18px] py-[12px] bg-[#fff] border border-[#f26a21] rounded-[100px] text-[#f26a21] text-[24px] font-bold">
										Googleでログイン
									</div>
									<p onClick={() =>setShowBtn('newreg')} className='inline border-b border-[#606060] text-[#606060] text-[20px] font-bold mt-[18px]'>新規登録はこちら</p>
								</div>
							)}	
						</div>
					)}
				</div>
			) : (
				<div className="flex flex-col justify-center items-center w-[100%]">
					<div onClick={() => setShowBtn('')} className='ippo_icon_n_big'></div>
					<p className='text-[#ff7a00] font-bold text-[20px]'>GROUND RULES</p>
					<div ref={contentRef} dangerouslySetInnerHTML={{ __html: groupListTemplate() }}
						 className="w-[80%] h-[370px] mt-[24px] p-[26px] border border-[#B6B6B6] rounded-[6px] overflow-y-scroll">
					</div>
					{!rulesScrolled ? (
						<div className='w-[224px] flex justify-center items-center mt-[20px] py-[12px] bg-[#b6b6b6] rounded-[100px] text-[#fff] text-[20px] font-bold'>同意する</div>
					) : (
						<div onClick={authKind}
							 className='w-[224px] flex justify-center items-center mt-[20px] py-[12px] bg-[#f26a21] rounded-[100px] text-[#fff] text-[20px] font-bold'>
							同意する
						</div>
					)}
				</div>
			)}



		</div>
	);
}
