// MessageDetailPage.jsx
import UserPageClient from '@/component/UserPageClient';

export default function MessageDetailPage({ params }) {
	const targetUserId = params.id;

	return <UserPageClient targetUserId={targetUserId} />;
}
