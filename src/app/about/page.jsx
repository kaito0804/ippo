"use client";

//クライアントコンポーネント
import Header from "@/component/Header";
import { useUserContext } from '@/utils/userContext';

export default function ListBox() {

 	const { userId, isHost, nowStatus } = useUserContext();

	return (
		<div className="content-bg-color">
			<Header/>
			
			<div className="header-adjust">
				about
			</div>

		</div>
	);
}
