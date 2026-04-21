import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 }); // 👈 only change here
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await connectDb();
    await Order.findByIdAndUpdate(session?.metadata?.orderId, { isPaid: true });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}