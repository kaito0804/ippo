import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    return new Response(JSON.stringify({ success: false, error: 'session_id is required' }), { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 支払い完了かどうかのチェック
    const paymentSucceeded = session.payment_status === 'paid';

    // ここでDBに登録済みかもチェックすると良い
    // const registered = await checkUserRegistered(session.metadata.user_id, session.metadata.group_id);

    return new Response(JSON.stringify({ success: paymentSucceeded }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
