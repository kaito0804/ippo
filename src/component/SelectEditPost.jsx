"use client";

//react/next.js用ライブラリ
import { useState, useEffect, useRef } from "react";

//データベース関連
import { supabase } from '@/utils/supabase/supabaseClient';
import { useUserContext } from '@/utils/userContext';

//コンポーネント
import EditPostDialog from "@/component/EditPostDialog";


export default function NewPostDialog({openSelectEditDialog, closeDialog }) {

	const { userProfile }               = useUserContext();
	const userId                        = userProfile?.id;
	const [myGroups, setMyGroups]       = useState([]);
	const [editDialog, setEditDialog]   = useState(null);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [isLoading, setIsLoading]     = useState(false);
		
	console.log(userId);

	useEffect(() => {
		if (!userId) return;
		const getMyCreateGroups = async () => {
			setIsLoading(true);

			const { data, error } = await supabase
			.from("groups")
			.select("*")
			.eq("created_by", userId)
			.order("created_at", { ascending: false });

			if (error) {
				console.error("グループ取得エラー:", error);
			} else {
				setMyGroups(data);
			}
			setIsLoading(false);
		};

		getMyCreateGroups();
	}, [userId]);

	



	return (
		<div>
			{isLoading && (
				<div className="loading-overlay">
					<div className="loading-icon">投稿中...</div>
				</div>
			)}

			<div className="content-bg-color fixed flex flex-col items-center w-full h-[calc(100%-91px)] px-[20px] py-[12px] gap-[12px] transition-all duration-300 z-[1000]"
				 style={openSelectEditDialog ? {bottom:'0'} : {bottom:'-100%'}}>

				<div className="w-[100%] text-[18px] font-bold">編集するイベントを選択</div>

				{openSelectEditDialog && (
					<div className="flex flex-col items-center w-[100%] py-[12px] gap-[28px] overflow-y-scroll">
						
						<ul className="flex flex-col items-center w-[100%] gap-[12px]">
							{myGroups && myGroups.length > 0 ? (
								myGroups.map((group) => (
								<li onClick={() => {setEditDialog(group); setOpenEditDialog(true);}} key={group.id} className="flex items-center justify-between w-[100%] border-b border-gray-200 py-[14px] px-[14px]">
									<div className="flex items-center">
										<div className="w-[50px] h-[50px] mr-[12px] bg-cover bg-center bg-no-repeat rounded-full" style={{ backgroundImage: `url(${group.image_url})` }}></div>
									</div>

									<div className="flex flex-col items-start justify-between w-[calc(100%-50px)] h-[100%] gap-[5px]">
										<div className="flex items-center justify-between w-full">
											<p className="text-[15px] font-bold">{group.name}</p>
											<p className="text-[11px] text-gray-500"> </p>
										</div>
										<div className="flex items-center justify-between w-full">
											<p className="text-[13px] text-gray-500">
												{group.description.replace(/<[^>]+>/g, '')}
											</p>
										</div>
									</div>
								</li>
								))
							) : (
								<li>グループはまだありません</li>
							)}
						</ul>

						
						<div className="flex justify-end items-center w-[100%] gap-[10px]">
							<div onClick={closeDialog} className="flex justify-center items-center w-[100px] py-[8px] bg-[#fff] text-[#F26A21] border border-[#F26A21] rounded-[100px] text-[13px] font-bold">キャンセル</div>
						</div>
					</div>
				)}

				<EditPostDialog group={editDialog} openEditDialog={openEditDialog} closeDialog={() => setOpenEditDialog(false)} />
			</div>

		</div>
	);
}
