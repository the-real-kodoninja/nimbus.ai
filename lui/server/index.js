const express = require('express');
const Stripe = require('stripe');
const app = express();
const stripe = Stripe('your-stripe-secret-key'); // Replace with your Stripe secret key

app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
  const { itemId, name, price } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name },
          unit_amount: price * 100, // Price in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000/marketplace?success=true',
    cancel_url: 'http://localhost:3000/marketplace?success=false',
  });

  res.json({ id: session.id });
});

app.listen(3001, () => console.log('Server running on port 3001'));
