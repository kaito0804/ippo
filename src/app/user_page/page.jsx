"use client";

import { useEffect, useState, useRef } from "react";
import { uploadToCloudinary } from "@/app/utils/cloudinary/cloudinary";
import { supabase } from "@/app/utils/supabase/supabaseClient";
import Header  from "@/app/component/Header/Header";
import Footer  from "@/app/component/Footer/Footer";
import { useUserContext } from '@/app/utils/userContext';

export default function UserPage() {

	const { userId, isHost, nowStatus, setNowStatus } = useUserContext();
	const [profile, setProfile] = useState(null);
	const [nameChangeTrigger, setNameChangeTrigger] = useState(false);
	const [editName, setEditName] = useState(""); 
	const [isEditing, setIsEditing] = useState(false);
  	const [commentText, setCommentText] = useState(profile?.comment || "");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId) return;

		const fetchProfile = async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from("user_profiles")
			.select("*")
			.eq("id", userId)
			.single();

		if (error) {
			console.error("プロフィール取得エラー:", error.message);
		} else {
			setProfile(data);
		}
		setLoading(false);
		};

		fetchProfile();
	}, [userId]);

	const iconChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			// Cloudinaryへアップロード
			const imageUrl = await uploadToCloudinary(file);

			// Supabaseのプロフィールに保存
			const { error: updateError } = await supabase
			.from("user_profiles")
			.update({ icon_path: imageUrl })
			.eq("id", userId);

			if (updateError) {
			alert("プロフィール更新に失敗しました");
			console.error(updateError);
			return;
			}

			// 表示用profile state更新
			setProfile((prev) => ({ ...prev, icon_path: imageUrl }));
		} catch (error) {
			console.error("エラー:", error);
		}
	};


	// 名前入力変更時
	const nameChange = (e) => {
		setEditName(e.target.value);
	};

	// 名前保存処理（Enterキー or フォーカス外れ時）
	const saveName = async () => {
		if (!editName || editName === profile.display_name) {
			setNameChangeTrigger(false);
			return;
		}

		const { error } = await supabase
			.from("user_profiles")
			.update({ display_name: editName })
			.eq("id", userId);

		if (error) {
			alert("名前の更新に失敗しました");
			console.error(error);
			return;
		}

		// 表示用に更新
		setProfile((prev) => ({ ...prev, display_name: editName }));
		setNameChangeTrigger(false);
	};


	const changeComment = async () => {
		try {
		// Supabaseに保存
		const { error } = await supabase
			.from("user_profiles")
			.update({ comment: commentText })
			.eq("id", userId);

		if (error) {
			console.error("自己紹介の更新に失敗:", error.message);
			alert("自己紹介の保存に失敗しました");
			return;
		}

		// ステート更新して編集モード解除
		setProfile((prev) => ({ ...prev, comment: commentText }));
		setIsEditing(false);
		} catch (err) {
		console.error("保存中エラー:", err);
		}
	};


	if (loading) return <div>読み込み中...</div>;

	return (
		<div>
			<Header title="プロフィール"/>
			
			<div className="h-adjust header-adjust overflow-y-scroll">
				<div className="flex flex-col items-center justify-center py-[30px] px-[20px]">
					<div className="user-icon-box">
						<div className="user-icon" style={{ backgroundImage: `url('${profile?.icon_path || 'https://res.cloudinary.com/dnehmdy45/image/upload/v1750906560/user-gray_jprhj3.svg'}')` }}></div>
						<label className="change-icon">
							<input type="file" accept="image/*" onChange={iconChange} className="hidden"/>
						</label>
					</div>
					{nameChangeTrigger ? (
						<input
							type="text"
							value={editName}
							onChange={nameChange}
							onBlur={saveName} // フォーカス外れたら保存
							onKeyDown={(e) => e.key === "Enter" && saveName()}
							className="py-[2px] px-[5px] text-[14px] font-bold mt-[10px] rounded-[5px] border border-[#e1e1e1]"
							autoFocus
						/>
						) : (
						<p
							onClick={() => {
							setEditName(profile.display_name || ""); // 編集用にセット
							setNameChangeTrigger(true);
							}}
							className="name-text text-[14px] font-bold mt-[10px] py-[3px]"
						>
							{profile.display_name || "匿名"}
						</p>
					)}

					<div className="flex justify-around items-center w-[100%] mt-[20px]">
						<div className="flex flex-col justify-center items-center gap-[2px] w-[33%]">
							<div className="font-bold">0</div>
							<div className="text-[14px] text-[#666]">フォロー</div>
						</div>
						<div className="flex flex-col justify-center items-center gap-[2px] w-[33%]">
							<div className="font-bold">0</div>
							<div className="text-[14px] text-[#666]">フォロワー</div>
						</div>
						<div className="flex flex-col justify-center items-center gap-[2px] w-[33%]">
							<div className="font-bold">0</div>
							<div className="text-[14px] text-[#666]">いいね</div>
						</div>
					</div>
					<div className="flex justify-center items-center w-[100%] mt-[20px]">
						<div className="flex justify-center items-center w-[160px] py-[8px] px-[5px] bg-[#e1e1e1] rounded-[10px] text-[14px] font-bold">プロフィールを編集</div>
					</div>
					<div className="flex flex-col justify-center items-center w-[100%] mt-[20px]">
						<p className="my-self-profile" onClick={() => setIsEditing(true)}>自己紹介文</p>
						{isEditing ? (
							<>
							<textarea
								className="w-full mt-[10px] border rounded p-2 text-[13px]"
								rows={4}
								value={commentText}
								onChange={(e) => setCommentText(e.target.value)}
								autoFocus
							/>
							<div className="flex justify-center items-center mt-[15px] gap-[20px]">
								<div onClick={changeComment} className="flex justify-center items-center w-[100px] py-1 bg-blue-500 text-white text-[13px] rounded">保存</div>
								<div onClick={() => setIsEditing(false)} className="flex justify-center items-center w-[100px] py-1 bg-gray-300 text-[13px] rounded">キャンセル</div>
							</div>
							</>
						) : (
							<p
							className="flex justify-left items-center w-[100%] text-[13px] mt-[10px] mx-auto cursor-pointer whitespace-pre-wrap"
							onClick={() => setIsEditing(true)}
							>
							{profile?.comment || "自己紹介が空欄です"}
							</p>

						)}
					</div>
				</div>

				<div className="flex justify-around items-center w-[100%] h-[50px] bg-[#fff] border-b border-[#e1e1e1] py-[10px]">
					<div className="list-icon"></div>
					<div className="favorite-icon"></div>
				</div>

				<ul>
					<li></li>
				</ul>
			</div>

			{/* フッター */}
			<Footer />
		</div>
	);
}