"use client";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useState, useEffect } from 'react';
import { useUserContext } from '@/utils/userContext';
import { ageList, genderList, hobbyList, reasonList } from "@/utils/data/prfList";

export default function FirstSetPrf() {
	const { userProfile }               = useUserContext();
	const [stage, setStage]             = useState("1");
	const [displayName, setDisplayName] = useState("");
	const [age, setAge]                 = useState("");
	const [gender, setGender]           = useState(""); 
	const [hobby, setHobby]             = useState([]); 
	const [reason, setReason]           = useState([]);
	const [email, setEmail]             = useState(userProfile?.email);

	// userProfileが取得されたらdisplayNameにセット
	useEffect(() => {
		if (userProfile?.display_name) {
			setDisplayName(userProfile.display_name);
		}
	}, [userProfile]);

	// メールアドレスの簡易チェック
	const isValidEmail = (email) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};


	// ステージ6で2.5秒後にトップページへリダイレクト
	useEffect(() => {
		if (stage === "7") {
			const timer = setTimeout(() => {
				window.location.href = '/top'; 
			}, 2500);

			return () => clearTimeout(timer);
		}
	}, [stage]);


	// プロフィール登録のサブミット処理
	const prfSubmit = async () => {
		if (!userProfile?.id) return;

		const { error } = await supabase.from('user_profiles').upsert({
			id: userProfile.id,
			display_name: displayName,
			age,
			gender,
			hobby,
			reason,
			email,
			first_set: true,
		}, { returning: 'minimal' });

		if (error) {
			alert('更新に失敗しました: ' + error.message);
			return;
		}
		setStage('7');
	};

	// 戻る処理
	const stageBack = () => {
		const stageNum = Number(stage);
		if (stageNum > 1 && stageNum < 6) {
			setStage(String(stageNum - 1));
		}
	};


	const isActive = displayName.trim() !== "";

	return (
		<div className='firstSet font-zen-maru-gothic flex flex-col items-center justify-center w-full h-screen bg-[#FEFAF1]'>
			
			{stage !== "7" && (
				<p className='text-[22px] font-bold text-[#f26a21]'>{stage}/{email ? "5" : "6"}</p>
			)}

			{stage === "1" ? (
				/*ユーザーネーム登録*/
				<div className='flex flex-col items-center justify-center'>
					<p className='text-[22px] font-bold text-[#f26a21]'>あなたのニックネームは？</p>
					<input
						type="text"
						name="display_name"
						id="display_name"
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						placeholder="例) らくだくん"
						className="w-[100%] mt-[8px] py-[14px] px-[18px] border-[3px] border-[#b6b6b6] rounded-[14px]"
					/>
					<div onClick={() => setStage('2')} className={`flex items-center justify-center w-[224px] mt-[90px] py-[14px] rounded-[100px] text-white transition-all duration-200 ${isActive ? 'bg-[#f26a21] cursor-pointer' : 'bg-[#b6b6b6] cursor-not-allowed'}`}>次へ</div>
					<p className="mt-[8px] text-[12px] text-[#b6b6b6]">後から変更可能です</p>
				</div>

			) : stage === "2" ? (
				/*年齢登録*/
				<div className='flex flex-col items-center justify-center'>
					<p className='text-[22px] font-bold text-[#f26a21]'>あなたの年代は？</p>
					<div className='flex flex-col items-center justify-between w-[100%] gap-[20px] mt-[20px]'>
						{ageList.map((item) => (
						<div key={item.id} className='flex flex-col items-center justify-between w-[100%]'>
							<input
							type="radio"
							name="age"
							id={`age-${item.id}`}
							value={item.id}
							checked={age === item.id}
							onChange={() => setAge(item.id)}
							className="hidden"
							/>
							<label htmlFor={`age-${item.id}`} className="prf-label">{item.label}</label>
						</div>
						))}
					</div>
					<div onClick={() => {if (age) {setStage('3');}}}  className={`${age ? 'bg-[#f26a21]' : 'bg-[#b6b6b6]'} flex items-center justify-center w-[224px] mt-[40px] py-[14px] rounded-[100px] text-white`}>次へ</div>
				</div>

			) : stage === "3" ? (
				/*性別登録*/
				<div className='flex flex-col items-center justify-center'>
					<p className='text-[22px] font-bold text-[#f26a21]'>あなたの性別は？</p>
					<div className='flex flex-col items-center justify-between w-[100%] gap-[20px] mt-[20px]'>
						{genderList.map((genderItem, index) => (
						<div key={genderItem.id} className='flex flex-col items-center justify-between w-[100%]'>
							<input 
							type="radio" 
							name="gender" 
							id={`gender-${genderItem.id}`} 
							value={genderItem.id} 
							checked={gender === genderItem.id}
							onChange={(e) => setGender(Number(e.target.value))} 
							className="hidden"
							/>
							<label htmlFor={`gender-${genderItem.id}`} className="prf-label">{genderItem.label}</label>
						</div>
						))}

					</div>
					<div onClick={() => {if (gender) {setStage('4');}}} className={`${gender ? 'bg-[#f26a21]' : 'bg-[#b6b6b6]'} flex items-center justify-center w-[224px] mt-[40px] py-[14px] rounded-[100px] text-white`}>次へ</div>
				</div>

			) : stage === "4" ? (
				/*趣味登録*/
				<div className='flex flex-col items-center justify-center w-[90%]'>
					<p className='text-[22px] font-bold text-[#f26a21]'>あなたの趣味は？</p>
					<div className='flex flex-wrap items-center justify-center w-[100%] gap-y-[20px] mt-[20px]'>
						{hobbyList.map((item) => (
							<div key={item.id} className="flex items-center justify-between w-[165px]">
								<input
								type="checkbox"
								id={`hobby-${item.id}`}
								value={item.id}
								checked={hobby.includes(item.id)}
								onChange={(e) => {
									if (e.target.checked) {
									setHobby((prev) => [...prev, item.id]);
									} else {
									setHobby((prev) => prev.filter((id) => id !== item.id));
									}
								}}
								className="hidden"
								/>
								<label htmlFor={`hobby-${item.id}`} className="prf-label multi">{item.label}</label>
							</div>
						))}

					</div>
					<div onClick={() => {if (hobby.length > 0) {setStage('5');}}} className={`${hobby.length > 0 ? 'bg-[#f26a21]' : 'bg-[#b6b6b6]'} flex items-center justify-center w-[224px] mt-[40px] py-[14px] rounded-[100px] text-white`}>次へ</div>
				</div>

			) : stage === "5" ? (
				/*IPPOに興味をもった理由は？*/
				<div className='flex flex-col items-center justify-center'>
					<p className='text-[22px] font-bold text-[#f26a21]'>IPPOに興味をもった理由は？</p>
					<div className='flex flex-col items-center justify-between w-[100%] gap-[20px] mt-[20px]'>
						{reasonList.map((reasonItem, index) => (
							<div key={index} className='flex flex-col items-center justify-between w-[100%]'>
								<input 
								type="checkbox" 
								name="reason" 
								id={`reason-${index}`} 
								value={reasonItem.id} 
								checked={reason.includes(reasonItem.id)}
								onChange={(e) => {
									const value = reasonItem.id;
									if (e.target.checked) {
									setReason(prev => [...prev, value]);
									} else {
									setReason(prev => prev.filter(item => item !== value));
									}
								}} 
								className="hidden"
								/>
								<label htmlFor={`reason-${index}`} className="prf-label">{reasonItem.label}</label>
							</div>
						))}
					</div>
					{email ? (
						<div onClick={() => {if (reason.length > 0) {prfSubmit();}}} className={`${reason.length > 0 ? 'bg-[#f26a21]' : 'bg-[#b6b6b6]'} flex items-center justify-center w-[224px] mt-[40px] py-[14px] rounded-[100px] text-white`}>次へ</div>
					) : (
						<div onClick={() => {if (hobby.length > 0) {setStage('6');}}} className={`${hobby.length > 0 ? 'bg-[#f26a21]' : 'bg-[#b6b6b6]'} flex items-center justify-center w-[224px] mt-[40px] py-[14px] rounded-[100px] text-white`}>次へ</div>
					)}
				</div>

			) : stage === "6" ? (
			/*メールアドレス登録*/
			<div className='flex flex-col items-center justify-center w-[90%]'>
				<p className='text-[22px] font-bold text-[#f26a21] text-center'>メールアドレスの<br/>ご登録をお願いします。</p>
				<input
					type="text"
					name="email"
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="例) abc@example.com"
					className="w-[100%] mt-[8px] py-[14px] px-[18px] border-[3px] border-[#b6b6b6] rounded-[14px]"
				/>
				<div onClick={() => {
					if (email.length > 0 && isValidEmail(email)) {
						prfSubmit();
					} else {
						alert('正しいメールアドレスを入力してください');
					}
					}} className={`${email.length > 0 ? 'bg-[#f26a21]' : 'bg-[#b6b6b6]'} flex items-center justify-center w-[224px] mt-[40px] py-[14px] rounded-[100px] text-white`}>
					次へ
				</div>
			</div>

			) : stage === "7" ? (
				<div className='fade-in flex flex-col items-center justify-center'>
					<div className="flex items-center justify-center w-[100px] h-[100px] bg-contains bg-no-repeat bg-center" style={{backgroundImage: `url(${"https://res.cloudinary.com/dnehmdy45/image/upload/v1753058128/camel_dm5s3s.svg"})`}}></div>
					<p className="text-[20px] font-bold text-[#f26a21] mt-[10px]">ようこそ！</p>
				</div>
			) : null}

			{stage !== "1" && stage !== "7" && (
				<div 
					onClick={stageBack} 
					className="mt-[20px] px-[2px] pb-[2px] text-[#333] border-b"
				>
					戻る
				</div>
			)}


		</div>
	);
}