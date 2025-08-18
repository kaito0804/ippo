"use client";

//クライアントコンポーネント
import Header from "@/component/Header";
import { useUserContext } from '@/utils/userContext';

export default function ListBox() {

 	const { userProfile } = useUserContext();

	return (
		<div className="content-bg-color">
			<Header/>
			
			<div className="header-adjust">
				about
			</div>

		</div>
	);
}
