import Stripe from "stripe";
import { z } from "zod";
import { env, hasStripe } from "../lib/env.js";

const schema = z.object({
  priceId: z.string().min(3)
});

export function registerCheckoutRoute(app) {
  const stripe = hasStripe() ? new Stripe(env.stripeSecretKey) : null;

  app.post("/api/create-checkout", async (req, res, next) => {
    try {
      if (!stripe) {
        throw new Error("Stripe chưa cấu hình.");
      }
      const payload = schema.parse(req.body);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          { price: payload.priceId, quantity: 1 }
        ],
        success_url: env.stripeSuccessUrl,
        cancel_url: env.stripeCancelUrl,
        customer_email: req.currentUser?.email || undefined,
        metadata: {
          user_id: req.currentUser?.id || "demo-user"
        }
      });

      res.json({ ok: true, url: session.url });
    } catch (error) {
      next(error);
    }
  });
}
