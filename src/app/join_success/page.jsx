import JoinSuccessClient from '@/component/JoinSuccessClient';

export default function JoinSuccessPage({ searchParams }) {
	const sessionId = searchParams?.session_id || null;
	const groupId = searchParams?.group || null;

	return <JoinSuccessClient groupId={groupId} sessionId={sessionId} />;
}
