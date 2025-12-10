export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js"; // Node 用
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { title, price, stripe_account_id, seller_id } = await req.json();

    if (!stripe_account_id) {
      return Response.json(
        { success: false, error: "no connected account" },
        { status: 400 }
      );
    }

    // Stripe Product
    const product = await stripe.products.create(
      { name: title },
      { stripeAccount: stripe_account_id }
    );

    const priceObj = await stripe.prices.create(
      {
        unit_amount: price,
        currency: "jpy",
        product: product.id,
      },
      { stripeAccount: stripe_account_id }
    );

    // --- Supabase Node Client（Service Role）---
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // --- 保存 ---
    const { error: insertError } = await supabaseAdmin.from("products").insert({
      seller_id,
      title,
      price,
      stripe_price_id: priceObj.id,
    });

    if (insertError) {
      console.error(insertError);
      return Response.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      product_id: product.id,
      price_id: priceObj.id,
    });
  } catch (e) {
    return Response.json({ success: false, error: e.message });
  }
}
