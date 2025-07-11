/*===============================
エリアリスト
================================*/
export const areaList = [
  '北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州'
];



/*===============================
テーマリスト
================================*/
export const themeList = [
  '映画', '演劇', '音楽', 'スポーツ', '自然', 'その他'
];



/*===============================
グループ詳細モーダルのテンプレート文
================================*/
export const groupListTemplate = (group) => {
	if (!group) return "";
	/*========================

	日付取得

	=========================*/
	function startDay(dateStr) {
		const date      = new Date(dateStr);
		const days      = ['日', '月', '火', '水', '木', '金', '土'];
		const year      = date.getFullYear();
		const month     = date.getMonth() + 1; // 月は0始まり
		const day       = date.getDate().toString().padStart(2, '0');
		const dayOfWeek = days[date.getDay()];

		return `${year}/${month}/${day}(${dayOfWeek})`;
	}

return `
<h2 class="text-[20px] font-bold">☘️ こんな方におすすめ</h2>
<ul class="flex flex-col gap-[3px] list-disc pl-5 mt-[5px]">
  <li>IPPOに興味がある方！</li>
  <li>新しい人との出会いや会話を楽しみたい方！</li>
  <li>いつもとは違う休日を過ごしたい方</li>
  <li>代官山に行ってみたい方！</li>
</ul>

<h2 class="text-[20px] font-bold mt-[36px]">🙇‍♂️重要事項</h2>
<ul class="flex flex-col gap-[3px] list-disc pl-5 mt-[5px]">
  <li>飲食代は各自ご負担をお願いいたします。</li>
  <li>お申し込み後のキャンセル・返金は、原則お受けしておりません。</li>
  <li>ただし、やむを得ない理由の場合は、システム手数料（340円）を差し引いた金額での返金となります。</li>
  <li>天候や主催者都合でイベントが中止になった場合は、全額返金いたします。</li>
</ul>

<h2 class="text-[20px] font-bold mt-[36px]">📍イベント詳細</h2>
<p class="mt-[5px]">集合時間：${startDay(group.start_date)} ${group.start_time?.slice(0, 5)}-${group.end_time?.slice(0, 5)}</p>
<p>開催場所：${group.venue}</p>
<p>定員：${group.member_count || "未定"}</p>
<p>参加費：${group.price || "無料"}</p>

<h2 class="text-[20px] font-bold mt-[36px]">🥾IPPOのグランドルール</h2>

<h3 class="font-semibold mt-[8px]">☀️ ネガティブは置いていこう</h3>
<p class="mt-[5px]">
  相手を傷つけるようなネガティブな発言はNG。<br>
  でも、自分の悩みを話すことは大歓迎です。<br>
  ここは安心して気持ちを打ち明けられる場所。思いやりを持ったコミュニケーションを心がけましょう。
</p>

<h3 class="font-semibold mt-[20px]">🌱 お互いの魅力を引き出そう</h3>
<p class="mt-[5px]">
  この場にいる人はみんな魅力的。<br>
  「どんな人なんだろう？」そんな気持ちで、相手の魅力を引き出す質問や声かけをしてみましょう。<br>
  あなたの魅力も、自然と周りに伝わっていきます。
</p>

<h3 class="font-semibold mt-[20px]">🙅‍♀️ ネットワークビジネスやその他の勧誘行為</h3>
<p class="mt-[5px]">
  IPPOは「誰もが安心して過ごせる場所」を大切にしています。<br>
  そのため、営業・勧誘・宗教など、目的を持ったアプローチはご遠慮いただいています。<br>
  万が一、そういった行為が見受けられた場合は、やむを得ずご退席をお願いすることがありますので、あらかじめご了承ください。<br>
  なにか気になることがあれば、主催者にいつでもご相談くださいね。
</p>

<h2 class="text-[20px] font-bold mt-[36px]">🚶‍♀️散歩コミュニティ「IPPO」について</h2>
<p class="mt-[5px]">
  「散歩を通じて、新しい自分に出会う」<br>
  そんなテーマで始まった、ゆるくてあたたかい散歩コミュニティです。
</p>

<p class="mt-2">
  「健康のために体を動かしたいけど、1人じゃなかなか続かない…」<br>
  「最近、人との会話がちょっと減ってきたかも」<br>
  そんな声から生まれたIPPO。
</p>

<p class="mt-2">
  誰かと話しながら歩くと、不思議と心も体も軽くなる。<br>
  ちょっとの刺激と、やさしい出会い。<br>
  肩肘張らずに、自分らしくいられる時間を一緒に楽しみませんか？<br>
  どなたでも、初めてでも、お気軽にどうぞ！
</p>
`;
}
