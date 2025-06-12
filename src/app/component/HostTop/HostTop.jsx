"use client";

//react/next.js用ライブラリ
import Image from "next/image";
import { useState, useRef } from "react";
import MyEditor from '@/app/component/MyEditor/myEditor';

//cloudinary関連
import { uploadToCloudinary } from "@/app/utils/cloudinary/cloudinary";

//データベース関連
import { supabase } from '@/app/utils/supabase/supabaseClient';
import { useUserContext } from '@/app/utils/userContext';

export default function HostTop() {

	const { userId }                    = useUserContext();
	const [name, setName]               = useState('');
	const [startDate, setStartDate]     = useState('');
	const [startTime, setStartTime]     = useState('');
	const [endDate, setEndDate]         = useState('');
	const [endTime, setEndTime]         = useState('');
	const [venue, setVenue]             = useState('');
	const [description, setDescription] = useState('');
	const [memberCount, setmemberCount] = useState(0);
	const [thumImage, setThumImage]     = useState(null);
	const [editorKey, setEditorKey]     = useState(0);
	const fileInputRef = useRef(null);


	const fileChange = async (event) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) {
			setThumImage(selectedFile);
		}
	};

	const submit = async (e) => {
		e.preventDefault();

		// バリデーション
		if (!name) {
			alert('グループ名は必須です');
			return;
		}

		let imageUrl = ''; 
		if (thumImage) {
			try {
				imageUrl = await uploadToCloudinary(thumImage);
			} catch (err) {
				console.error('画像アップロード失敗:', err);
				alert('画像のアップロードに失敗しました');
				return;
			}
		}

		// groupsテーブルへのINSERT
		const { data, error } = await supabase.from('groups').insert({
			name,
			created_by: userId,
			start_date: startDate,
			start_time: startTime,  
			end_date: endDate,
			end_time: endTime,         
			venue     : venue,     
			image_url : imageUrl,         
			description,                
			member_count: memberCount
		});

		if (error) {
			console.error('登録エラー:', error);
			alert('登録に失敗しました');
			return;
		}

		alert('登録完了！');

		// フォーム初期化
		setName('');
		setStartDate('');
		setStartTime('');
		setEndDate('');
		setEndTime('');
		setVenue('');
		setDescription('');
		setEditorKey(prev => prev + 1);
		setmemberCount(0);
		setThumImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}

	};

	return (
		<form onSubmit={submit} className="flex flex-col items-center w-full h-[calc(100vh-24px)] py-[30px] px-[20px] gap-[40px] overflow-y-scroll">
			<label className="flex flex-col justify-center w-[100%] gap-[10px]">
				<p className="text-[16px] font-bold">イベント名</p>
				<input 
					type="text" name="groupName" placeholder="グループ名"value={name} onChange={e => setName(e.target.value)} required 
					className="px-[10px] py-[5px] border-[1px] rounded-[5px]" />
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

			<label className="flex flex-col justify-center w-[100%] gap-[10px]">
				<p className="text-[16px] font-bold">会場名:</p>
				<input 
					type="text" name="venue" value={venue} onChange={e => setVenue(e.target.value)} required
					className="px-[10px] py-[5px] border-[1px] rounded-[5px]" />
			</label>

			<label htmlFor="file" className="flex flex-col justify-center w-[100%] gap-[10px]">
				<p className="text-[16px] font-bold">サムネイル:</p>
				<input 
					type="file" name="file" id="file" accept="image/*" onChange={fileChange} ref={fileInputRef} required
					className="px-[10px] py-[5px] border-[1px] rounded-[5px]"/>
			</label>

 			<MyEditor  key={editorKey} content={description} onChange={setDescription} />

			<label className="flex flex-col justify-center w-[100%] gap-[10px]">
				<p className="text-[16px] font-bold">参加人数:</p>
				<select name="memberCount" value={memberCount} onChange={e => setmemberCount(Number(e.target.value))} required>
				{Array.from({ length: 31 }, (_, i) => (
					<option key={i} value={i}>{i}</option>
				))}
				</select>
			</label>

			<button type="submit" className="btn-submit w-[260px] my-[10px] py-[8px] bg-[#3048ff] text-white rounded-[100px] font-bold text-[15px]">登録する</button>
		</form>
	);
}
