// MessageDetailPage.jsx
import MessageDetailClient from '@/component/MessageDetailClient';

export default function MessageDetailPage({ searchParams }) {
	const groupId = searchParams?.groupId || null;
	const anotherUserId = searchParams?.user || null;

	return <MessageDetailClient groupId={groupId} anotherUserId={anotherUserId} />;
}
