// app/login_loading/page.jsx
import { Suspense } from 'react';
import LoginLoading from '@/app/component/LoginLoadingClient/LoginLoadingClient';

export default function Page() {
	return (
		<Suspense fallback={<div>読み込み中...</div>}>
			<LoginLoading />
		</Suspense>
	);
}
