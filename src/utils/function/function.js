/*===============================
時間フォーマット 2025-08-29 → 2025/08/29
================================*/
export function startDay(dateStr) {
	const date      = new Date(dateStr);
	const days      = ['日', '月', '火', '水', '木', '金', '土'];
	const year      = date.getFullYear();
	const month     = date.getMonth() + 1; //月は0始まり
	const day       = date.getDate().toString().padStart(2, '0');
	const dayOfWeek = days[date.getDay()];

	return `${year}/${month}/${day}(${dayOfWeek})`;
}

/*===============================
時間フォーマット 2025-08-29 → 8月29日(金)
================================*/
export function startDayJP(dateStr) {
  const date      = new Date(dateStr);
  const days      = ['日', '月', '火', '水', '木', '金', '土'];
  const month     = date.getMonth() + 1; // 1〜12
  const day       = date.getDate();        // 1〜31
  const dayOfWeek = days[date.getDay()];

  return `${month}月${day}日(${dayOfWeek})`;
}


/*===============================
時間フォーマット 00:00 → 00時間00分 
================================*/
export function formatDurationHM(durationStr) {
	if (!durationStr) return '';
	const [hStr, mStr] = durationStr.split(':');
	const h = parseInt(hStr, 10);
	const m = parseInt(mStr, 10);

	if (h > 0 && m > 0) return `${h}時間${m}分`;
	if (h > 0) return `${h}時間`;
	if (m > 0) return `${m}分`;
	return '0分';
}

/*===============================
  プロフィール情報を取得
================================*/
import { ageList, genderList, hobbyList, reasonList } from '@/utils/data/prfList';
export function getLabelById(id, type) {
	const listsMap = {
		age: ageList,
		gender: genderList,
		hobby: hobbyList,
		reason: reasonList,
	};

	if (!id || !listsMap[type]) return "未設定";

	const list = listsMap[type];

	// 複数選択の場合
	if (Array.isArray(id)) {
		const labels = id
		.map(i => list.find(item => item.id === i)?.label)
		.filter(Boolean);
		return labels.length > 0 ? labels.join('、') : "未設定";
	}

	// 単一選択
	return list.find(item => item.id === id)?.label || "未設定";
};

