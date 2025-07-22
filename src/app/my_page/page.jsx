"use client";

//react/next.js用ライブラリ
import { useEffect, useState, useRef } from "react";
import Link from 'next/link'

//cloudinary関連
import { uploadToCloudinary } from "@/utils/cloudinary/cloudinary";

//データベース関連
import { supabase } from "@/utils/supabase/supabaseClient";

//コンポーネント
import { useUserContext } from '@/utils/userContext';
import Header  from "@/component/Header";

export default function UserPage() {

	const { userId, isHost, nowStatus, setNowStatus }   = useUserContext();
	const [profile, setProfile]                         = useState(null);
	const [groupMemberProfiles, setGroupMemberProfiles] = useState([]);
	const [nameChangeTrigger, setNameChangeTrigger]     = useState(false);
	const [editName, setEditName]                       = useState(""); 
	const [isEditing, setIsEditing]                     = useState(false);
  	const [commentText, setCommentText]                 = useState(profile?.comment || "");
	const textareaRef                                   = useRef(null);
	const [friendList, setFriendList]                   = useState();
	const [loading, setLoading]                         = useState(true);

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


	/*===================================

	以前一緒になったことのあるユーザーを取得

	====================================*/
	useEffect(() => {
		const fetchMyExpiredGroupMembers = async () => {
			if (!userId) return;

			const nowISOString = new Date().toISOString();

			// ① RPC で自分が参加していた終了済みグループを取得
			const { data: expiredGroups, error: groupError } = await supabase
				.rpc("get_my_expired_groups", {
					now_ts: nowISOString,
					uid: userId
				});

			if (groupError) {
				console.error("RPC取得エラー:", groupError);
				return;
			}

			if (!expiredGroups || expiredGroups.length === 0) {
				setGroupMemberProfiles([]);
				return;
			}

			// ② 自分以外の user_id を抽出（重複なし）
			const otherUserIds = [
				...new Set(
					expiredGroups.flatMap(group =>
						(group.member || []).filter(uid => uid !== userId)
					)
				)
			];

			if (otherUserIds.length === 0) {
				setGroupMemberProfiles([]);
				return;
			}

			// ③ user_profiles を取得
			const { data: profiles, error: profileError } = await supabase
				.from("user_profiles")
				.select("id, display_name, icon_path, comment, is_host, now_status")
				.in("id", otherUserIds);

			if (profileError) {
				console.error("プロフィール取得エラー:", profileError);
				return;
			}

			// ④ ユーザーIDごとに所属グループをマッピング
			const userToGroupsMap = {};
			expiredGroups.forEach(group => {
				(group.member || []).forEach(uid => {
					if (uid === userId) return;
					if (!userToGroupsMap[uid]) userToGroupsMap[uid] = [];
					userToGroupsMap[uid].push(group);
				});
			});

			// ⑤ プロフィールにグループ詳細を結合
			const combinedData = profiles.map(profile => ({
				...profile,
				group_details: userToGroupsMap[profile.id] || []
			}));

			setGroupMemberProfiles(combinedData);
		};

		fetchMyExpiredGroupMembers();
	}, [userId]);



	useEffect(() => {
		if (isEditing && textareaRef.current) {
			const el = textareaRef.current;
			el.focus();
			el.setSelectionRange(el.value.length, el.value.length); // カーソルを末尾に
		}
	}, [isEditing]);

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

	const setComment = () => {
		setCommentText(profile?.comment || ""); // 保存されたコメントを初期値に
		setIsEditing(true); 
	}

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
		<div className="content-bg-color">
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
						<p className="my-self-profile" onClick={setComment}>自己紹介文</p>
						{isEditing ? (
							<>
							<textarea
								ref={textareaRef}
								className="w-full mt-[10px] border rounded p-2 text-[13px]"
								rows={4}
								value={commentText}
								onChange={(e) => setCommentText(e.target.value)}
							/>
							<div className="flex justify-center items-center mt-[15px] gap-[20px]">
								<div onClick={changeComment} className="flex justify-center items-center w-[100px] py-1 bg-blue-500 text-white text-[13px] rounded">保存</div>
								<div onClick={() => setIsEditing(false)} className="flex justify-center items-center w-[100px] py-1 bg-gray-300 text-[13px] rounded">キャンセル</div>
							</div>
							</>
						) : (
							<p className="flex justify-left items-center w-[100%] text-[13px] mt-[10px] mx-auto cursor-pointer whitespace-pre-wrap">
								{profile?.comment || "自己紹介が空欄です"}
							</p>
						)}
					</div>
				</div>

				<div className={`${friendList ? 'friend-active' : 'list-active'} relative flex justify-around items-center w-[100%] h-[50px] border-b border-[#e1e1e1]`}>
					<div className="list-icon" onClick={() => setFriendList(false)}></div>
					<div className="friend-icon" onClick={() => setFriendList(true)}></div>
				</div>

				<ul className="flex flex-col justify-center items-center w-[100%] px-[10px]">
					{friendList ? (
						groupMemberProfiles.map((prf) => (
							<li key={prf.id} className="flex justify-between items-center w-[100%] py-[10px] border-b border-[#e1e1e1]">
								<div className="flex justify-center items-center mr-[10px]">
									<Link href={`/user_page/${prf.id}`} className="w-[50px] h-[50px] rounded-full bg-center bg-cover bg-no-repeat border border-[#e1e1e1]" style={{ backgroundImage: `url('${prf.icon_path || 'https://res.cloudinary.com/dnehmdy45/image/upload/v1750906560/user-gray_jprhj3.svg'}')` }}></Link>
								</div>
								<div className="flex flex-col justify-center items-start w-[calc(100%-60px)]">
									<div className="flex justify-between items-center w-[100%]">
										<p className="text-[14px] font-bold">{prf.display_name}<span className="text-[12px] ml-[1px]">さん</span></p>
										<Link href={`message_detail?user=${prf.id}`} className="w-[24px] h-[24px] rounded-full bg-center bg-contain bg-no-repeat"  style={{ backgroundImage: `url('${'https://res.cloudinary.com/dnehmdy45/image/upload/v1752542554/mail_gzqdko.svg'}')` }}></Link>
									</div>
									<div className="flex flex-wrap justify-left items-center mt-[5px] gap-[5px]">
										{prf.group_details.map((group) => (
											<p className="text-[12px] border border-[#e1e1e1] rounded-[10px] px-[5px] py-[2px]" key={group.id}>{group.name}</p>
										))}
									</div>
									<p className="text-[12px] mt-[5px] truncate max-w-[100%] text-[13px] text-[#737373]">自己紹介：{prf.comment || "自己紹介が空欄です"}</p>
								</div>
							</li>
						))
					) : (
						<div>
							test
						</div>
					)}
				</ul>
			</div>

		</div>
	);
}