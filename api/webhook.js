import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  
  let rawBody = '';
  await new Promise((resolve, reject) => {
    req.on('data', chunk => { rawBody += chunk; });
    req.on('end', resolve);
    req.on('error', reject);
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment successful! Session ID:', session.id);
    console.log('Customer email:', session.customer_details?.email);
    console.log('Amount:', session.amount_total);
  }

  res.json({ received: true });
}

export const config = {
  api: { bodyParser: false }
};
