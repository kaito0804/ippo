"use client";

import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react";
import { useUserContext } from '@/utils/userContext';

export default function StripeConnectedClient({ accountId, paySuccess, products }) {
	const router = useRouter();
	const supabase = createClientComponentClient();
	const { userProfile } = useUserContext();
	const userId = userProfile?.id;

	const [title, setTitle] = useState("");
	const [price, setPrice] = useState(500);

	const handleBack = () => router.replace("/test2");

	useEffect(() => {
		if (!accountId || !userId) return;

		const saveAccountId = async () => {
		const { error } = await supabase
			.from("user_profiles")
			.update({ stripe_account_id: accountId })
			.eq("id", userId);

		if (!error) {
			console.log("Stripeアカウント保存完了");
		} else {
			console.error("Stripeアカウント保存エラー:", error.message);
		}
		};

		saveAccountId();
	}, [accountId, userId, supabase]);

	const handleCreate = async () => {
		const res = await fetch("/api/stripeConnectCreateProduct", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			title,
			price,
			stripe_account_id: userProfile?.stripe_account_id,
			seller_id: userId,
		}),
		});

		const data = await res.json();

		if (data.success) {
		alert("商品が登録されました！");
		location.reload();
		} else {
		alert("登録に失敗しました: " + data.error);
		}
	};

	const handleBuy = async (product) => {
		const res = await fetch("/api/stripeConnectCheckOut", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			price: product.price,
			price_id: product.stripe_price_id,
			stripe_account_id: product.seller_stripe_account_id,
		}),
		});

		const data = await res.json();

		if (!data.success) {
		alert("エラー: " + data.error);
		return;
		}

		window.location.href = data.url;
	};

	return (
		<div className="h-[100dvh] p-6 overflow-y-scroll">
		{paySuccess ? (
			<div className="flex flex-col items-center justify-center h-[100dvh]">
			<p>購入完了！</p>
			<div onClick={handleBack} className="w-[300px] flex items-center justify-center bg-orange-500 text-white font-bold px-6 py-3 rounded-full mt-4">
				購入ページに戻る
			</div>
			</div>
		) : (
			<div>
			{accountId && <h1>Stripe 連携完了！</h1>}

			<div>
				<h1 className="text-[18px] font-bold">商品を出品する</h1>
				<input className="border p-2 w-full mt-4" placeholder="商品名" value={title} onChange={(e) => setTitle(e.target.value)} />
				<input className="border p-2 w-full mt-4" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="金額（円）" />
				<button onClick={handleCreate} className="bg-orange-500 text-white px-6 py-3 rounded mt-4">出品する</button>
			</div>

			<div className="mt-10">
				<h1 className="text-[18px] font-bold">商品を購入する</h1>
				{products.map((product) => (
				<div key={product.id} className="product-box mt-4 border p-4 rounded">
					<h3>{product.title}</h3>
					<p>{product.price} 円</p>
					<button onClick={() => handleBuy(product)} className="bg-blue-500 text-white px-6 py-2 rounded">
					購入する
					</button>
				</div>
				))}
			</div>
			</div>
		)}
		</div>
	);
}
