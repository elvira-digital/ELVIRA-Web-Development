import {
  ModalFormSection,
  ModalFormField,
} from "../../../../../../components/ui/modalform";
import type { LaundryOrderWithDetails } from "../../../../../../hooks/hotel-laundry/orders/useLaundryOrders";

// Temporary type until database types are regenerated
interface LaundryOrderWithDates extends LaundryOrderWithDetails {
  pickup_date?: string | null;
  delivery_date?: string | null;
}

interface PickupDeliveryDetailsSectionProps {
  order: LaundryOrderWithDetails;
}

export function PickupDeliveryDetailsSection({
  order,
}: PickupDeliveryDetailsSectionProps) {
  const orderWithDates = order as LaundryOrderWithDates;

  return (
    <ModalFormSection title="Pickup & Delivery Details">
      <div className="grid grid-cols-2 gap-4">
        <ModalFormField
          label="Pickup Date"
          value={
            orderWithDates.pickup_date
              ? new Date(orderWithDates.pickup_date).toLocaleDateString()
              : "N/A"
          }
        />
        <ModalFormField
          label="Delivery Date"
          value={
            orderWithDates.delivery_date
              ? new Date(orderWithDates.delivery_date).toLocaleDateString()
              : "N/A"
          }
        />
      </div>
    </ModalFormSection>
  );
}
