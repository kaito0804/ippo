// src/app/join_success/page.jsx
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function JoinSuccessPage() {
	const searchParams = useSearchParams();
	const sessionId = searchParams.get('session_id');
	const [result, setResult] = useState(null);

	useEffect(() => {
		if (!sessionId) return;

		async function checkPayment() {
			const res = await fetch(`/api/checkPayment?session_id=${sessionId}`);
			const data = await res.json();
			setResult(data.success);
		}
		checkPayment();
	}, [sessionId]);

  if (result === null) return <p>読み込み中...</p>;

  return (
    <div>
      	{result ? <p>イベントに参加しました</p> : <p>参加登録に失敗しました</p>}
    </div>
  );
}
