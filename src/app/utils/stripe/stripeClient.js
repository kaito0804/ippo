// utils/stripe/handleStripeJoin.js
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51Ri8ze2cMnMMoYxBqhGEVtg9IwEPeDfK9TkS8i6OTrZccOjJXZalwaevkyAcVDG0QOYAxptmvtrlK6PIn5pYP2dT00xSSSFJh4');

export const handleStripeJoin = async (group) => {
	const stripe = await stripePromise;

	const res = await fetch('/api/stripeBackend', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
		groupId: group.id,
		price: group.price,
		}),
	});

	const session = await res.json();
	await stripe.redirectToCheckout({ sessionId: session.id });
};
