import { ModalForm } from "../../../../../../components/ui/modalform";
import { Button } from "../../../../../../components/ui";
import { OrderInfoSection } from "./OrderInfoSection";
import { PickupDeliveryDetailsSection } from "./PickupDeliveryDetailsSection";
import { OrderItemsSection } from "./OrderItemsSection";
import { OrderNotesSection } from "./OrderNotesSection";
import type { LaundryOrderModalProps } from "./types";

export function LaundryOrderModal({
  isOpen,
  onClose,
  order,
}: LaundryOrderModalProps) {
  if (!order) return null;

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title="Laundry Order Details"
      size="md"
      footer={
        <div className="flex justify-end">
          <Button variant="primary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <OrderInfoSection order={order} />
      <PickupDeliveryDetailsSection order={order} />
      <OrderItemsSection order={order} />
      <OrderNotesSection order={order} />
    </ModalForm>
  );
}
