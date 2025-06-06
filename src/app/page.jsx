import Image from "next/image";
import AuthButtons from "@/app/component/NewRegAuth/newregauth";

export default function Home() {
	return (
		<div className="flex flex-col justify-center items-center">

			<div className="flex flex-col justify-center items-center w-[100%] h-[100vh] bg-[#fffcfa]">
				<div className="absolute top-[calc(50%-120px)] flex flex-col justify-center items-center text-[#ff7a00]">
					<p className="font-bold text-[60px]">IPPO</p>
					<p className="font-bold text-[18px]">散歩コミュニティ</p>
				</div>
			</div>	
			
			<div className="absolute bottom-[80px] flex flex-col justify-center items-center gap-[30px]">
				<div className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#ff9731] text-white rounded-[100px] font-bold">新規アカウント作成</div>
				<div className="w-[300px] py-[12px] px-[5px] flex flex-col justify-center items-center bg-[#4363ff] text-white rounded-[100px] font-bold">ログイン</div>
			</div>

			<AuthButtons />

		</div>
	);
}
