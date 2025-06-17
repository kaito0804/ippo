import MessageDetailClient from '@/app/component/MessageDetailClient/MessageDetailClient';

export default function MessageDetailPage({ searchParams }) {
 	return <MessageDetailClient groupId={searchParams.groupId} />;
}

