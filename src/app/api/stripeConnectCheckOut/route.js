export const dynamic = "force-dynamic";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { price, price_id, stripe_account_id } = await req.json();

    if (!price_id || !stripe_account_id) {
      return Response.json(
        { success: false, error: "Missing price_id or account_id" },
        { status: 400 }
      );
    }

    // Stripe Checkout Session 作成（子アカウントで実行）
   const session = await stripe.checkout.sessions.create(
	{
		payment_intent_data: {
		application_fee_amount: Math.floor(price * 0.1), // ← 親アカウントの取り分
		// 💡 destination は書かない！！！！！
		},
		line_items: [
		{
			price: price_id,
			quantity: 1,
		},
		],
		mode: "payment",
		success_url: `${process.env.NEXT_PUBLIC_APP_URL}/test2?success=1`,
		cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
	},
	{
		stripeAccount: stripe_account_id, // ← 子アカウントでチェックアウトを作る
	}
	);


    return Response.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
