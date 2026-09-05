import { NextResponse } from "next/server";
import { createOrder, OrderError, orderInputSchema, buildCustomerWhatsAppMessage } from "@/lib/orders";
import { normalizeSettings } from "@/lib/data";
import { adminClient } from "@/lib/supabase/admin";
import { waLink } from "@/lib/format";
import { alertOwner, notifyNewOrder } from "@/lib/whatsapp";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = orderInputSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue?.message ?? "Please check your details.", field: String(issue?.path?.[0] ?? "form") }, { status: 400 });
  }
  try {
    const order = await createOrder(parsed.data);
    const { data: settingsRow } = await adminClient().from("settings").select("*").eq("id", 1).maybeSingle();
    const settings = normalizeSettings(settingsRow);
    const whatsappUrl = waLink(settings.whatsapp_number, buildCustomerWhatsAppMessage(order, settings));
    // Best-effort notifications; never block the response on them.
    void Promise.allSettled([notifyNewOrder(order), alertOwner(order)]);
    return NextResponse.json({ order, whatsappUrl }, { status: 201 });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message, field: e.field }, { status: 422 });
    console.error("order create failed", e);
    return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 500 });
  }
}
