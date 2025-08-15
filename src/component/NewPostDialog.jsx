"use client";

//react/next.js用ライブラリ
import { useState, useEffect, useRef } from "react";
import DatePicker from 'react-datepicker';
import TimePicker from 'react-time-picker';
import 'react-datepicker/dist/react-datepicker.css';
import MyEditor from '@/component/myEditor';

//cloudinary関連
import { uploadToCloudinary } from "@/utils/cloudinary/cloudinary";

//データベース関連
import { supabase } from '@/utils/supabase/supabaseClient';
import { useUserContext } from '@/utils/userContext';


export default function NewPostDialog({openDialog, closeDialog, placeName }) {

	const { userId }                    = useUserContext();
	const [name, setName]               = useState('');
	const [startDate, setStartDate]     = useState('');
	const [startTime, setStartTime]     = useState('12:00');
	const [duration, setDuration]       = useState(''); 
	const [venue, setVenue]             = useState('');
	const [goal, setGoal]               = useState('');
	const [description, setDescription] = useState('');
	const [memberCount, setmemberCount] = useState(0);
	const [thumImage, setThumImage]     = useState(null);
	const [theme, setTheme]             = useState([]); 
	const [editorKey, setEditorKey]     = useState(0);
	const [price, setPrice]             = useState('');
	const fileInputRef                  = useRef(null);
	const [previewUrl, setPreviewUrl]   = useState(null);
	const [isLoading, setIsLoading]     = useState(false);
	const formRef                       = useRef(null);


	useEffect(() => {
		if (placeName) {
			setVenue(placeName);
		}
	}, [placeName]);

	const fileChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			setThumImage(file);
			setPreviewUrl(URL.createObjectURL(file));
		} else {
			setPreviewUrl(null);
		}
	};

	const timeStep = (step) => {
		setDuration((prev) => Math.max(0, prev + step * 30));
	};

	 const formatDuration = (min) => {
		const h = Math.floor(min / 60);
		const m = min % 60;
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
				created_by : userId,
				name,
				description, 
				start_date   : startDate,
				start_time   : startTime, 
				duration     : formatDuration(duration),      
				venue        : venue,  
				goal         : goal,   
				image_url    : imageUrl, 
				theme        : theme,        
				member_count : memberCount,
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
				group_name: groupData.name,
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
			setStartDate('');
			setStartTime('');
			setDuration('');
			setVenue('');
			setGoal('');
			setTheme('');
			setDescription('');
			setEditorKey(prev => prev + 1);
			setmemberCount(0);
			setPrice('');
			setThumImage(null);
			setPreviewUrl(null);
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

			<div className="content-bg-color fixed flex flex-col items-center w-full h-[calc(100%-91px)] px-[20px] py-[12px] gap-[12px] transition-all duration-300 z-[1000]"
				 style={openDialog ? {bottom:'0'} : {bottom:'-100%'}}>

				<div className="w-[100%] text-[18px] font-bold">イベントを作成</div>

				<form 
					ref={formRef}
					onSubmit={submit} 
					className="flex flex-col items-center w-[100%] py-[12px] gap-[28px] overflow-y-scroll"	
				>
					

					<label className="flex flex-col justify-center w-[100%] gap-[2px]">
						<p className="text-[14px] font-bold">イベント名</p>
						<input 
							type="text" name="groupName" placeholder="イベント名を記入"value={name} onChange={e => setName(e.target.value)} required 
							className="px-[10px] py-[10px] bg-[#fff] rounded-[5px] text-[14px]" />
					</label>

					<MyEditor  key={editorKey} content={description} onChange={setDescription} />

					<div className="flex justify-center items-center w-[100%] gap-[6px]">
						<div className="flex flex-col justify-center w-[33%] gap-[2px]">
							<p className="text-[14px] font-bold">日程</p>
							<DatePicker
								selected={startDate}
								onChange={(date) => setStartDate(date)}
								placeholderText="2025/00/0"
								dateFormat="yyyy/MM/dd"
								className="w-[100%] px-[10px] py-[5px] bg-[#fff] rounded-[5px] text-[14px]"
								popperPlacement="bottom-end"
								required
							/>
						</div>

						<label className="flex flex-col justify-center w-[33%] gap-[2px]">
							<p className="text-[14px] font-bold">時間</p>
							<TimePicker
							onChange={setStartTime}
							value={startTime}
							clearIcon={null}
							clockIcon={null}
							className="px-[10px] py-[5px] bg-[#fff] rounded-[5px] text-[14px]"
							required
							/>
						</label>

						<label className="relative flex flex-col justify-center w-[33%] gap-[2px]">
							<p className="text-[14px] font-bold">所要時間</p>
							<input
							type="text" 
							value={formatDuration(duration)}
							onChange={(e) => {
								const val = e.target.value;
								const match = val.match(/^(\d{1,2}):(\d{2})$/);
								if (match) {
								const h = parseInt(match[1], 10);
								const m = parseInt(match[2], 10);
								if (m >= 0 && m < 60) {
									const totalMin = h * 60 + m;
									setDuration(totalMin);
								}
								} else if (val === '') {
									setDuration(0);
								}
							}}
							className="px-[10px] py-[5px] bg-[#fff] rounded-[5px] text-[14px]"
							/>

							<div className="absolute flex flex-col justify-between items-center h-[30px] top-[25px] right-[5px]">
								<button
									type="button"
									onClick={() => timeStep(1)}
									className="w-[18px] h-[18px] bg-no-repeat bg-center bg-contain"
									style={{backgroundImage: 'url("https://res.cloudinary.com/dnehmdy45/image/upload/v1752628034/nav-arrow-up_pnbz6g.svg")'}}
								>
								</button>
								<button
									type="button"
									onClick={() => timeStep(-1)}
									className="w-[18px] h-[18px] bg-no-repeat bg-center bg-contain"
									style={{backgroundImage: 'url("https://res.cloudinary.com/dnehmdy45/image/upload/v1752628033/nav-arrow-down_uwlzxy.svg")'}}
								>
								</button>
							</div>
						</label>
					</div>

					<div className="flex justify-center items-center w-[100%] gap-[10px]">
						<label className="flex flex-col justify-center w-[calc(50%-5px)] gap-[2px]">
							<p className="text-[14px] font-bold">スタート(場所)</p>
							<input 
								type="text" name="venue" value={venue} onChange={e => setVenue(e.target.value)} required
								placeholder="場所を選ぶ"
								className="px-[10px] py-[10px] bg-[#fff] rounded-[5px] text-[13px]" />
						</label>

						<label className="flex flex-col justify-center w-[calc(50%-5px)] gap-[2px]">
							<p className="text-[14px] font-bold">ゴール</p>
							<input 
								type="text" name="goal" value={goal} onChange={e => setGoal(e.target.value)} required
								placeholder="場所を選ぶ"
								className="px-[10px] py-[10px] bg-[#fff] rounded-[5px] text-[13px]" />
						</label>
					</div>			

					<div className="flex justify-center items-center w-[100%] gap-[10px]">
						<label className="flex flex-col justify-center w-[calc(50%-5px)] gap-[2px]">
							<p className="text-[14px] font-bold">定員数</p>
							
							<select name="memberCount" value={memberCount} onChange={e => setmemberCount(Number(e.target.value))} 
								className="appearance-auto px-[10px] py-[5px] bg-[#fff] rounded-[5px] text-[14px]" required>
								{Array.from({ length: 31 }, (_, i) => (
									<option key={i} value={i}>{i}</option>
								))}
							</select>
						</label>

						<label className="flex flex-col justify-center w-[calc(50%-5px)] gap-[2px]">
							<p className="text-[14px] font-bold">参加費</p>
							<input 
								type="number" min="0" step="100" inputMode="numeric" name="groupPrice" placeholder="¥" value={price} onChange={e => setPrice(e.target.value)} 
								className="appearance-auto px-[10px] py-[5px] bg-[#fff] rounded-[5px] text-[14px]" />
						</label>
					</div>	

					<div className="flex flex-col justify-center items-center w-[100%] gap-[2px]">
						<p className="w-[100%] text-[14px] font-bold">画像</p>
						<label
							htmlFor="file"
							className="w-[100%] px-[10px] py-[5px] bg-[#fff] rounded-[5px] text-[14px]"
						>
							<span className="text-[14px] text-[#aaa]">カバーフォトを選ぶ</span>
							<input
							type="file"
							id="file"
							accept="image/*"
							onChange={fileChange}
							ref={fileInputRef}
							className="hidden"
							required
							/>
						</label>

						{/* プレビュー表示 */}
						{previewUrl && (
							<div className="mt-2">
							<img
								src={previewUrl}
								alt="プレビュー"
								className="max-w-[100%] object-contain"
							/>
							</div>
						)}
					</div>

				</form>
					
				<div className="flex justify-end items-center w-[100%] gap-[10px]">
					<div onClick={closeDialog} className="flex justify-center items-center w-[100px] py-[8px] bg-[#fff] text-[#F26A21] border border-[#F26A21] rounded-[100px] text-[13px] font-bold">キャンセル</div>
					<div onClick={() => formRef.current?.requestSubmit()} className="flex justify-center items-center w-[100px] py-[8px] bg-[#F26A21] text-[#fff] rounded-[100px] text-[13px] font-bold">作成</div>
				</div>
			</div>

		</div>
	);
}
