// MessageDetailPage.jsx
import MessageDetailClient from '@/component/MessageDetailClient';

export default async function MessageDetailPage({ searchParams }) {
	const params = await searchParams;
	const groupId = params?.groupId || null;
	const anotherUserId = params?.user || null;

	return <MessageDetailClient groupId={groupId} anotherUserId={anotherUserId} />;
}
