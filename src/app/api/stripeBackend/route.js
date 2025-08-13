// src/app/api/stripeBackend/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req) {
  try {
    const body = await req.json();
    const { groupId, price, returnUrl, userId } = body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: { name: `グループ参加（ID: ${groupId}）` },
          unit_amount: Number(price),
        },
        quantity: 1,
      }],
      success_url: `${APP_URL}/join_success?group=${groupId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl || `${APP_URL}/top`,
      metadata: {
        group_id: groupId,
        user_id: userId,
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (err) {
    console.error('[Stripe Error]', err);
    return NextResponse.json({ error: 'Stripeセッション作成に失敗しました' }, { status: 500 });
  }
}


