import { ModalFormSection } from "../../../../../../components/ui/modalform";
import type { LaundryOrderWithDetails } from "../../../../../../hooks/hotel-laundry/orders/useLaundryOrders";

interface OrderItemsSectionProps {
  order: LaundryOrderWithDetails;
}

// Temporary type until database types are regenerated
interface LaundryOrderWithPrice extends LaundryOrderWithDetails {
  total_price?: number;
}

export function OrderItemsSection({ order }: OrderItemsSectionProps) {
  if (!order.laundry_order_items || order.laundry_order_items.length === 0) {
    return (
      <ModalFormSection title="Laundry Services">
        <p className="text-sm text-gray-500">No services in this order.</p>
      </ModalFormSection>
    );
  }

  return (
    <ModalFormSection title="Laundry Services">
      <div className="space-y-3">
        {order.laundry_order_items.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            {/* Service Icon */}
            <div className="shrink-0">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg border border-emerald-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
            </div>

            {/* Service Details */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {item.laundry_services?.description || "Unknown Service"}
              </p>
              <p className="text-sm text-gray-600 capitalize">
                Category: {item.laundry_services?.category || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Quantity: {item.quantity} × $
                {item.price_at_order?.toFixed(2) || "0.00"}
              </p>
            </div>

            {/* Price */}
            <div className="shrink-0 text-right">
              <p className="font-semibold text-gray-900">
                $
                {((item.quantity || 0) * (item.price_at_order || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-300">
          <p className="font-semibold text-gray-900">Total</p>
          <p className="font-bold text-lg text-emerald-600">
            $
            {(order as LaundryOrderWithPrice).total_price?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>
    </ModalFormSection>
  );
}
