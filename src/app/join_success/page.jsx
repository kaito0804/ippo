import Link from "next/link";
import JoinGroupClient from "@/component/JoinGroupClient";

export default function JoinSuccessPage({ searchParams }) {
	const group = searchParams.group;

	if (!group) {
		return (
		<div>
			<p>グループIDが指定されていません。</p>
			<Link href="/">トップページへ戻る</Link>
		</div>
		);
	}

	return (
		<div>
		<JoinGroupClient groupId={group} />
		<Link href="/">トップページへ戻る</Link>
		</div>
	);
}
