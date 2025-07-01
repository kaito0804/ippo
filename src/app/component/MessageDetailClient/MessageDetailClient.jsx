"use client";

//react/next.js用ライブラリ
import { useEffect, useState } from "react";
import Link from 'next/link'

//cloudinary関連
import { uploadToCloudinary } from "@/app/utils/cloudinary/cloudinary";

//データベース関連
import { supabase } from "@/app/utils/supabase/supabaseClient";
import { useUserContext } from '@/app/utils/userContext';

//フロント処理関連
import { useSearchParams } from "next/navigation";


export default function MessageDetailClient() {
const searchParams            = useSearchParams();
const groupId                 = searchParams.get("groupId")
const { userId, isHost, nowStatus, setNowStatus } = useUserContext();
const [messages, setMessages] = useState([]);
const [group, setGroup]       = useState(null);
const [newMsg, setNewMsg]     = useState("");
const [selectedImage, setSelectedImage] = useState(null);

useEffect(() => {
  const fetchMessagesAndGroup = async () => {
    const [{ data: messageData, error: messageError }, { data: groupData, error: groupError }] = await Promise.all([
      supabase
        .from("messages")
        .select(`
          *,
          user_profiles:user_id (
            display_name,
            icon_path
          )
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true }),

      supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single(),
    ]);

    if (messageError) {
      console.error("メッセージ取得エラー:", messageError.message);
    } else {
      setMessages(messageData);
    }

    if (groupError) {
      console.error("グループ取得エラー:", groupError.message);
    } else {
      setGroup(groupData);
    }
  };

  fetchMessagesAndGroup();

  const subscription = supabase
    .channel("custom:messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      async (payload) => {
        const newMessage = payload.new;

        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("display_name, icon_path")
          .eq("id", newMessage.user_id)
          .single();

        if (error) {
          console.error("プロフィール取得エラー:", error.message);
        }

        const enrichedMessage = {
          ...newMessage,
          user_profiles: profile || {},
        };

        setMessages((prev) => [...prev, enrichedMessage]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, [groupId]);



const imageChange = (e) => {
	const file = e.target.files[0];
	if (file) {
		setSelectedImage(file);
	}
};


// メッセージ送信
const sendMessage = async () => {
	if (!newMsg && !selectedImage) {
		alert("メッセージを入力してください");
		return;
	}

	let imageUrl = null;
	if (selectedImage) {
		imageUrl = await uploadToCloudinary(selectedImage);
	}

	// display_name 取得処理は不要に
	// 送信処理
	const { data, error } = await supabase
		.from("messages")
		.insert([
		{
			content: newMsg,
			user_id: userId,
			group_id: groupId,
			image_url: imageUrl,
		},
		]);

	if (error) {
		console.error("送信エラー:", error.message);
	} else {
		setNewMsg("");
		setSelectedImage(null);
	}
};



	return (
		<div>
			<div className="fixed top-[0] flex justify-left items-center w-[100%] py-[10px] px-[5px] bg-[#fff] border-b border-[#e0e0e0] z-[100]">
				<Link href="/message_box" className="w-[28px] h-[28px] mr-[10px] bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('https://res.cloudinary.com/dnehmdy45/image/upload/v1751266821/nav-arrow-left_orpd2v.svg')`}}></Link>
				{group ? (
					<div className="flex items-center">
						<div className="w-[29px] h-[29px] mr-[10px] bg-cover bg-center bg-no-repeat rounded-full" style={{ backgroundImage: `url(${group.image_url})` }}></div>
						<p className="text-[12px] font-bold">{group.name}</p>
					</div>
				) : (
					<p>グループ情報を読み込み中...</p>
				)}
			</div>
			<div className="w-[100%] h-[calc(100dvh-50px)] pt-[50px] px-[16px] overflow-y-scroll">
				<ul className="w-[100%] py-[20px]">
					{(() => {

						const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
						const jpDate = (isoDateStr) => {
							const date = new Date(isoDateStr);
							return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${weekdays[date.getDay()]})`;
						};

						// 各日付で最初のメッセージだけ日付表示するために日付トラッキング	
						let lastDateStr = null;
						return messages.map((msg) => {
							const isOwnMessage      = msg.user_id === userId;
							const msgDateStr        = msg.created_at.split("T")[0]; // "2025-07-01"など	
							const showDateSeparator = msgDateStr !== lastDateStr;	
							if (showDateSeparator) {	
								lastDateStr = msgDateStr;	
							}

							return (
								<li key={msg.id} className="relative flex flex-col mb-[10px]">
									{showDateSeparator && (
										<div className="flex items-center justify-center my-2">
											<p className="inline-block mx-auto py-[2px] px-[12px] bg-[#a6a6a6] text-[#fff] rounded-[100px] text-[11px]">
											{jpDate(msgDateStr)}
											</p>
										</div>
									)}

									{isOwnMessage && (
										<div className={`flex items-center my-1 text-sm`}>
											<div className={`message-text mine`}>
												{msg.image_url && (
													<div className="flex items-center justify-center">
														<div className="w-[120px] h-[120px] m-[5px] mt-[10px] bg-cover bg-center bg-no-repeat rounded-lg" style={{ backgroundImage: `url(${msg.image_url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto/')})` }}/>
													</div>
													)}
												<p className="text-left p-[5px]">{msg.content}</p>
											</div>
										</div>
									)}

									{!isOwnMessage && (
										<div className="flex items-start w-[100%]">
											<div
											className="w-[30px] h-[30px] min-w-[30px] mr-[7px] bg-cover bg-center bg-no-repeat rounded-full border border-[#e0e0e0]"
											style={{
												backgroundImage: `url(${
												msg.user_profiles?.icon_path
													? msg.user_profiles.icon_path.replace('/upload/', '/upload/w_40,h_40,c_fill,q_auto/')
													: 'https://res.cloudinary.com/dnehmdy45/image/upload/v1750917949/user-middle-gray_z3eql3.svg'
												})`,
											}}
											></div>
											<div className="w-[100%]">
											<div className="text-[10px] text-gray-500 font-bold mb-[1px]">{msg.user_profiles?.display_name || "匿名"}</div>
											<div className={`flex items-center my-1 text-sm`}>
												<div className={`message-text others`}>
													{msg.image_url && (
														<div className="flex items-center justify-center">
														<div
															className="w-[120px] h-[120px] m-[5px] mt-[10px] bg-cover bg-center bg-no-repeat rounded-lg"
															style={{
																backgroundImage: `url(${msg.image_url.replace(
																	'/upload/',
																	'/upload/w_200,h_200,c_fill,q_auto/'
																)})`,
															}}
														/>
														</div>
													)}
													<p className="text-left p-[5px]">{msg.content}</p>
												</div>
											</div>
											</div>
										</div>
										)}


									
								</li>
							);
						});
					})()}
				</ul>

				<div className="fixed bottom-[0] left-[0] flex justify-between items-center w-[100%] pt-[10px] pb-[15px] px-[15px] bg-[#fff] z-[100]">
					{selectedImage && (
						<div className="img-preview-box">
							<img src={URL.createObjectURL(selectedImage)} alt="プレビュー" className="w-[100px] rounded-lg"/>
						</div>
					)}
					<label className="w-[22px] h-[22px] bg-cover bg-center bg-no-repeat cursor-pointer"
						style={{ backgroundImage: `url('https://res.cloudinary.com/dnehmdy45/image/upload/v1751332855/camera_igrw7c.svg')` }}
					>
						<input type="file" accept="image/*" onChange={imageChange} className="hidden"/>
					</label>					
					<input
						value={newMsg}
						onChange={(e) => setNewMsg(e.target.value)}
						placeholder="メッセージを入力"
						className="w-[80%] px-[10px] py-[6px] rounded-[100px] bg-[#f2f2f2] text-[13px]"
					/>
					<div onClick={sendMessage} className="w-[22px] h-[22px] bg-cover bg-center bg-no-repeat" style={{backgroundImage : `url('https://res.cloudinary.com/dnehmdy45/image/upload/v1751332483/send_nfcvzx.svg')`}}></div>
				</div>
			</div>

			
		</div>
	);
}
