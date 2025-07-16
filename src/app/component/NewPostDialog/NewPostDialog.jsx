"use client";

//react/next.js用ライブラリ
import { useState, useEffect, useRef } from "react";
import MyEditor from '@/app/component/MyEditor/myEditor';

//cloudinary関連
import { uploadToCloudinary } from "@/app/utils/cloudinary/cloudinary";

//データベース関連
import { supabase } from '@/app/utils/supabase/supabaseClient';
import { useUserContext } from '@/app/utils/userContext';

//クライアントコンポーネント
import { areaList, themeList } from '@/app/utils/data/groupList';


export default function NewRegPost({openDialog, closeDialog, placeName, clickPosition }) {

	const { userId }                    = useUserContext();
	const [name, setName]               = useState('');
	const [area, setArea]               = useState('');
	const [startDate, setStartDate]     = useState('');
	const [startTime, setStartTime]     = useState('');
	const [endDate, setEndDate]         = useState('');
	const [endTime, setEndTime]         = useState('');
	const [venue, setVenue]             = useState('');
	const [description, setDescription] = useState('');
	const [memberCount, setmemberCount] = useState(0);
	const [thumImage, setThumImage]     = useState(null);
	const [theme, setTheme]             = useState([]); 
	const [editorKey, setEditorKey]     = useState(0);
	const [price, setPrice]             = useState('');
	const fileInputRef                  = useRef(null);
	const [isLoading, setIsLoading]     = useState(false);


	useEffect(() => {
		if (placeName) {
			setVenue(placeName);
		}
	}, [placeName]);

	const fileChange = async (event) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) {
			setThumImage(selectedFile);
		}
	};

	const submit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (!name) {
				alert('グループ名は必須です');
				return;
			}

			let imageUrl = ''; 
			if (thumImage) {
				imageUrl = await uploadToCloudinary(thumImage);
			}

			const { data: groupData, error } = await supabase.from('groups').insert({
				name,
				created_by : userId,
				area       : area,
				start_date : startDate,
				start_time : startTime,  
				end_date   : endDate,
				end_time   : endTime,         
				venue      : venue,     
				image_url  : imageUrl, 
				theme      : theme,        
				description,                
				member_count : memberCount,
				lat          : clickPosition?.lat || null,
				lng          : clickPosition?.lng || null,
				price        : price
			})
			.select()
			.single();

			if (error || !groupData) {
				console.error('登録エラー:', error);
				alert('登録に失敗しました');
				return;
			}

			const { error: memberError } = await supabase.from('group_members').insert({
				group_id: groupData.id,
				user_id: userId,
				created_by: userId,
				joined_at: new Date().toISOString(),
				last_read_at: new Date().toISOString(),
			});

			if (memberError) {
				console.error('ホスト登録エラー:', memberError);
				alert('グループは作成されましたが、ホストの参加登録に失敗しました');
				// ここで return せずに処理継続するかどうかはお好みで
			}

			setIsLoading(false);
			alert('登録完了！');

			// フォーム初期化
			setName('');
			setArea('');
			setStartDate('');
			setStartTime('');
			setEndDate('');
			setEndTime('');
			setVenue('');
			setTheme('');
			setDescription('');
			setEditorKey(prev => prev + 1);
			setmemberCount(0);
			setPrice('');
			setThumImage(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		} catch (err) {
			console.error('予期せぬエラー:', err);
			alert('エラーが発生しました');
		} finally {
			setIsLoading(false);
			closeDialog();
		}
	};



	return (
		<div>
			{isLoading && (
				<div className="loading-overlay">
					<div className="loading-icon">投稿中...</div>
				</div>
			)}

			<form 
				onSubmit={submit} 
				className="fixed flex flex-col items-center w-full h-[100%] py-[60px] px-[20px] gap-[40px] bg-[#fff] overflow-y-scroll transition-all duration-300 z-[1000]"
				style={openDialog ? {bottom:'0'} : {bottom:'-100%'}}
				>

				<div onClick={closeDialog} className="close-icon"></div>

				<label className="flex flex-col justify-center w-[100%] gap-[10px]">
					<p className="text-[16px] font-bold">会場名 (集合場所)</p>
					<input 
						type="text" name="venue" value={venue} onChange={e => setVenue(e.target.value)} required
						className="px-[10px] py-[5px] border-[1px] rounded-[5px]" />
				</label>

				<label className="flex flex-col justify-center w-[100%] gap-[10px]">
					<p className="text-[16px] font-bold">イベント名</p>
					<input 
						type="text" name="groupName" placeholder="イベント名"value={name} onChange={e => setName(e.target.value)} required 
						className="px-[10px] py-[5px] border-[1px] rounded-[5px]" />
				</label>

				<label className="flex flex-col justify-center w-[100%] gap-[10px]">
					<p className="text-[16px] font-bold">エリア</p>
					<select name="area" value={area} onChange={e => setArea(e.target.value)} required>
						<option value="" disabled>エリアを選択</option>
						{areaList.map((area, index) => (
							<option key={index} value={area}>{area}</option>
						))}
					</select>
				</label>

				<label className="flex flex-col justify-center w-[100%] gap-[10px]">
					<p className="text-[16px] font-bold">開始日:</p>
					<input 
						type="date" name="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required
						className="px-[10px] py-[5px] border-[1px] rounded-[5px]"/>
					<input 
						type="time" name="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required
						className="px-[10px] py-[5px] border-[1px] rounded-[5px]"/>
				</label>

				<label  className="flex flex-col justify-center w-[100%] gap-[10px]">
					<p className="text-[16px] font-bold">終了日:</p>
					<input 
						type="date" name="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required
						className="px-[10px] py-[5px] border-[1px] rounded-[5px]" />
					<input 
						type="time" name="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} required
						className="px-[10px] py-[5px] border-[1px] rounded-[5px]" />
				</label>

				<label htmlFor="file" className="flex flex-col justify-center w-[100%] gap-[10px]">
					<p className="text-[16px] font-bold">サムネイル:</p>
					<input 
						type="file" name="file" id="file" accept="image/*" onChange={fileChange} ref={fileInputRef} required
						className="px-[10px] py-[5px] border-[1px] rounded-[5px]"/>
				</label>

				<label className="flex flex-col justify-center w-[100%] gap-[10px]">
					<p className="text-[16px] font-bold">テーマ</p>
					<div className="flex flex-wrap gap-[10px]">
						{themeList.map((item) => (
							<label key={item} className="flex items-center gap-[6px]">
								<input
									type="checkbox"
									value={item}
									checked={theme.includes(item)}
									onChange={(e) => {
										if (e.target.checked) {
											setTheme([...theme, item]);
										} else {
											setTheme(theme.filter(t => t !== item));
										}
									}}
								/>
								<span>{item}</span>
							</label>
						))}
					</div>
				</label>


				<MyEditor  key={editorKey} content={description} onChange={setDescription} />

				<label className="flex flex-col justify-center w-[100%] gap-[10px]">
					<p className="text-[16px] font-bold">参加人数:<span className="text-[13px] font-normal ml-[10px]">※主催者を含めた人数です</span></p>
					
					<select name="memberCount" value={memberCount} onChange={e => setmemberCount(Number(e.target.value))} required>
					{Array.from({ length: 31 }, (_, i) => (
						<option key={i} value={i}>{i}</option>
					))}
					</select>
				</label>

				<label className="flex flex-col justify-center w-[100%] gap-[10px]">
					<p className="text-[16px] font-bold">値段</p>
					<input 
						type="number" min="0" step="100" inputMode="numeric" name="groupPrice" placeholder="100円" value={price} onChange={e => setPrice(e.target.value)} 
						className="appearance-auto px-[10px] py-[5px] border-[1px] rounded-[5px]" />
				</label>


				<button type="submit" className="btn-submit w-[260px] my-[10px] py-[8px] bg-[#3048ff] text-white rounded-[100px] font-bold text-[15px]">登録する</button>
			</form>

		</div>
	);
}
