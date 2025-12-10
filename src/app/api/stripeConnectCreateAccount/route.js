// /app/api/stripeConnectCreateAccount/route.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
	try {
		// すでに Connect アカウントがある場合、そのIDを使う
		// まだなら、新規で作成する
		const account = await stripe.accounts.create({
			type: "express",
			capabilities: {
				card_payments: { requested: true },
				transfers: { requested: true }
			}
		});

		const accountLink = await stripe.accountLinks.create({
			account: account.id,
			refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/test?refresh=1`,
			return_url: `${process.env.NEXT_PUBLIC_APP_URL}/test2?connected=2&account_id=${account.id}`,
			type: "account_onboarding",
		});


		return Response.json({ url: accountLink.url });
	} catch (error) {
		console.log(error);
		return new Response("Error creating account link", { status: 500 });
  	}
}
