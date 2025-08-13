// utils/stripe/handleStripeJoin.js
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  'pk_test_51Ri8ze2cMnMMoYxBqhGEVtg9IwEPeDfK9TkS8i6OTrZccOjJXZalwaevkyAcVDG0QOYAxptmvtrlK6PIn5pYP2dT00xSSSFJh4'
);

export const handleStripeJoin = async (group) => {
  const stripe = await stripePromise;

  // 直前のページURL（無ければデフォルトに）
  const previousUrl = document.referrer || `${window.location.origin}/top`;

  const res = await fetch('/api/stripeBackend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      groupId: group.id,
      price: group.price,
      returnUrl: previousUrl,
    }),
  });

  const session = await res.json();

  if (session.id) {
    await stripe.redirectToCheckout({ sessionId: session.id });
  } else {
    console.error('Stripe セッション作成に失敗:', session);
  }
};
