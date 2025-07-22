import { supabase } from "@/utils/supabase/supabaseServer";
import Header from "@/component/Header";

export default async function UserPage({ params }) {
	const userId = params.id;

	const { data: profile, error } = await supabase
		.from("user_profiles")
		.select("*")
		.eq("id", userId)
		.single();

	if (error || !profile) {
		return <div>プロフィールが見つかりません</div>;
	}

	return (
		<div>
			<Header title={`${profile.display_name || "ユーザー"}のプロフィール`} />

			<div className="h-adjust header-adjust overflow-y-scroll">
				<div className="flex flex-col items-center justify-center py-[30px] px-[20px]">
					<div className="user-icon-box">
						<div
							className="user-icon"
							style={{
							backgroundImage: `url('${profile.icon_path || "https://res.cloudinary.com/dnehmdy45/image/upload/v1750906560/user-gray_jprhj3.svg"}')`,
							}}
						></div>
					</div>
					
					<p className="text-[16px] font-bold mt-[10px]">
						{profile.display_name || "匿名"}
					</p>

					<div className="flex flex-col justify-center items-center w-[100%] mt-[20px]">
						<p className="my-self-profile">自己紹介文</p>
						<p className="flex justify-left items-center w-[100%] text-[13px] mt-[10px] mx-auto cursor-pointer whitespace-pre-wrap">
							{profile?.comment || "自己紹介が空欄です"}
						</p>
					</div>
				</div>
			</div>

		</div>
	);
}
