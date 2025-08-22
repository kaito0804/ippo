import Stripe from 'stripe';
import { addUserToGroup } from '@/lib/addUserToGroup'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    const sig  = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    try {
      	event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      	return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
		const session = event.data.object;
		const groupId = session.metadata.group_id;
		const userId  = session.metadata.user_id;

		try {
			await addUserToGroup(userId, groupId);
		} catch (error) {
			console.error('参加登録処理中のエラー:', error);
		}
    }

	return new Response(JSON.stringify({ received: true }), { status: 200 });
}
