import Image from "next/image";
import { getCurrentUser } from '@/lib/auth-helpers';
import AuthButtons from "@/component/newregauth";


export default async  function Home() {
	const user = await getCurrentUser();

	return (
		<div className="bg-[#FEFAF1]">
			<AuthButtons user={user} />
		</div>
	);
}
