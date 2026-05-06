import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export { stripe };

export async function getOrCreateCustomer(
  tenantId: string,
  tenantName: string,
  tenantEmail: string,
  stripeCustomerId: string | null
) {
  if (stripeCustomerId) {
    return stripe.customers.retrieve(stripeCustomerId);
  }

  return stripe.customers.create({
    name: tenantName,
    email: tenantEmail,
    metadata: { tenantId },
  });
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
}

export async function createPaymentLink(
  amount: number,
  currency: string,
  description: string,
  metadata: Record<string, string>
) {
  return stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: description },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata,
  });
}

export function constructWebhookEvent(
  body: Buffer,
  sig: string,
  secret: string
) {
  return stripe.webhooks.constructEvent(body, sig, secret);
}
