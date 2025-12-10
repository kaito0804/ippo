import { createClient } from "@supabase/supabase-js";
import StripeConnectedClient from "@/component/test2comp";

const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function Test2Page({ searchParams }) {
	const params = await searchParams;
	const accountId = params.account_id || null;
	const paySuccess = params.success || null;
	console.log(params);
	console.log("accountId", accountId);
	// サーバー側で商品を取得
	const { data: products } = await supabaseAdmin
		.from("products")
		.select(`
		*,
		seller:user_profiles(stripe_account_id)
		`)
		.order("created_at", { ascending: false });

	// seller.stripe_account_id を展開
	const mappedProducts = products.map((p) => ({
		...p,
		seller_stripe_account_id: p.seller?.stripe_account_id,
	}));

	return (
		<StripeConnectedClient
			accountId={accountId}
			paySuccess={paySuccess}
			products={mappedProducts}
		/>
	);
}
