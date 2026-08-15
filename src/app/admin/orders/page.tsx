import { OrderStatusSwitch } from "@/components/admin/OrderStatusSwitch";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/format";
import { paymentMethods } from "@/lib/site-config";
import type { OrderRow } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

/**
 * Orders.
 *
 * Deliberately not a checkout dashboard: no money passed through this site, so
 * nothing here can tell you whether an order was paid. Only the owner can,
 * by looking at the account the transfer was sent to. The status control says
 * so rather than implying the site knows.
 */
function methodLabel(id: string) {
  return paymentMethods.find((m) => m.id === id)?.label ?? id;
}

export default async function OrdersPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as OrderRow[];
  const awaiting = orders.filter((o) => o.status === "placed");

  return (
    <>
      <h1 className="text-h2 text-spruce">Orders</h1>
      <p className="measure mt-2 text-small text-canvas-deep">
        No payment goes through this website, so nothing here knows whether an
        order has been paid. Mark one paid only once you have seen the transfer
        land in the account itself — a notification in a payment app can be
        faked, and a screenshot certainly can.
      </p>

      {error && (
        <p role="alert" className="mt-8 text-small font-medium text-foxred">
          Could not load orders: {error.message}. If this says the table is
          missing, run supabase/patch-04-orders.sql.
        </p>
      )}

      {orders.length > 0 && (
        <p className="eyebrow mt-8 text-foxred">
          {String(awaiting.length).padStart(2, "0")} awaiting payment
        </p>
      )}

      {orders.length === 0 ? (
        <div className="hairline mt-8 pt-10">
          <p className="text-body text-spruce">
            No orders yet. They arrive here the moment someone completes
            checkout, and by email at the same time.
          </p>
        </div>
      ) : (
        <ul className="mt-6">
          {orders.map((order) => (
            <li key={order.id} className="hairline py-6 first:border-t-0">
              <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
                <div>
                  <p className="font-mono text-data text-foxred">
                    {order.reference}
                  </p>
                  <h2 className="mt-1 text-h3 font-body font-semibold text-spruce">
                    {order.puppy_name} — {formatPrice(order.amount_cents)}
                  </h2>
                  <p className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-data text-canvas-deep">
                    <span>{order.buyer_name}</span>
                    <a
                      href={`mailto:${order.buyer_email}`}
                      className="underline decoration-brass underline-offset-4 hover:text-foxred"
                    >
                      {order.buyer_email}
                    </a>
                    <a
                      href={`tel:${order.buyer_phone.replace(/[^0-9+]/g, "")}`}
                      className="underline decoration-brass underline-offset-4 hover:text-foxred"
                    >
                      {order.buyer_phone}
                    </a>
                  </p>
                  <p className="eyebrow mt-2 text-canvas-deep">
                    Paying by {methodLabel(order.payment_method)} ·{" "}
                    {formatDate(order.created_at.slice(0, 10))}
                    {order.paid_confirmed_at &&
                      ` · confirmed ${formatDate(order.paid_confirmed_at.slice(0, 10))}`}
                  </p>
                </div>

                <OrderStatusSwitch id={order.id} status={order.status} />
              </div>

              {order.notes && (
                <p className="measure mt-4 text-body text-spruce">
                  {order.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
