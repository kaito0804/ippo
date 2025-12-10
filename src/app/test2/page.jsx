"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { useUserContext } from '@/utils/userContext';

export default function StripeConnected() {
	const params    = useSearchParams();
	const router = useRouter();
	const accountId = params.get("account_id");
	const paySuccess = params.get("success");
	const supabase  = createClientComponentClient();
	const { userProfile, setUserProfile } = useUserContext();
	const userId    = userProfile?.id;
	const [title, setTitle] = useState("");
  	const [price, setPrice] = useState(500);
	const [products, setProducts] = useState([]);
	
	// ------------------------------
	// 商品取得
	// ------------------------------
	useEffect(() => {
		const fetchProducts = async () => {
			const { data, error } = await supabase
			.from("products")
			.select(`
				*,
				seller:user_profiles(stripe_account_id)
			`)
			.order("created_at", { ascending: false });

			if (!error && data) {
			// seller.stripe_account_id を展開
			const mapped = data.map((p) => ({
				...p,
				seller_stripe_account_id: p.seller?.stripe_account_id,
			}));
			setProducts(mapped);
			}
		};

		fetchProducts();
	}, [supabase]);



	// ------------------------------
	// 商品登録
	// ------------------------------
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


	const handleBack = () => {
		router.replace("/test2");
	};

	// ------------------------------
	// 購入処理
	// ------------------------------
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

	// ------------------------------
	// Stripe アカウント保存
	// ------------------------------
	useEffect(() => {
		if (!accountId || !userId) return;

		const saveAccountId = async () => {
		await supabase
			.from("user_profiles")
			.update({ stripe_account_id: accountId })
			.eq("id", userId);
		alert("Stripeアカウント連携が完了しました！");
		};

		saveAccountId();
	}, [accountId, userId, supabase]);


	return (
		<div className="h-[100dvh] p-6 overflow-y-scroll">
			{paySuccess ? (
				<div className="flex flex-col items-center justify-center h-[100dvh]">
					<p>購入完了！</p>
					<div onClick={handleBack} className="w-[300px] flex items-center justify-center bg-orange-500 text-white font-bold px-6 py-3 rounded-full mt-4">購入ページに戻る</div>
				</div>
			) : (
				<div>
					{accountId && (
						<h1>Stripe 連携完了！</h1>
					)}
					<div>
						<h1 className="text-[18px] font-bold">商品を出品する</h1>

						<input
							className="border p-2 w-full mt-4"
							placeholder="商品名"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>

						<input
							className="border p-2 w-full mt-4"
							type="number"
							value={price}
							onChange={(e) => setPrice(Number(e.target.value))}
							placeholder="金額（円）"
						/>

						<button
							onClick={handleCreate}
							className="bg-orange-500 text-white px-6 py-3 rounded mt-4"
						>
							出品する
						</button>
					</div>

					<div className="mt-10">
						<h1 className="text-[18px] font-bold">商品を購入する</h1>

						{products.map((product) => (
							<div key={product.id} className="product-box mt-4 border p-4 rounded">
								<h3>{product.title}</h3>
								<p>{product.price} 円</p>
								<button
								onClick={() => handleBuy(product)}
								className="bg-blue-500 text-white px-6 py-2 rounded"
								>
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
