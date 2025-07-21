import Image from "next/image";
import { getCurrentUser } from '@/lib/auth-helpers';
import AuthButtons from "@/component/NewRegAuth/newregauth";


export default async  function Home() {
	const user = await getCurrentUser();

	return (
		<div>
			<AuthButtons user={user} />
		</div>
	);
}
