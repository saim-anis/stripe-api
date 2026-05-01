const stripe = require('stripe')(process.env.sk_test_51TLyBm8Bh5mbNofJu1ggPHRCS1sohiyiYYjxwV18uBI5Du2wOBL7hc4BaMmjyT0aoIXuQXntdw4mE3duV2x78nV100lVUnj1TB);

export default async function handler(req, res) {
  
  res.setHeader('Access-Control-Allow-Origin', 'https://masters-meat-box.webflow.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { items } = req.body;
    // items format: [{name, price, quantity, image}]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // dollars to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'https://masters-meat-box.webflow.io/success',
      cancel_url: 'https://masters-meat-box.webflow.io/cart',
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
}
