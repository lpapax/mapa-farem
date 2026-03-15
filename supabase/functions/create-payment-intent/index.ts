// supabase/functions/create-payment-intent/index.ts
// Deploy: supabase functions deploy create-payment-intent
// Env:    supabase secrets set STRIPE_SECRET_KEY=sk_live_...
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { amount, currency = 'czk', farmName, orderId } = await req.json();

    if (!amount || amount < 1) {
      return new Response(JSON.stringify({ error: 'Neplatná částka' }), { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // haléře
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { farmName: farmName ?? '', orderId: orderId ?? '' },
    });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
