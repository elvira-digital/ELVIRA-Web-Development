import {
  ModalFormSection,
  ModalFormField,
} from "../../../../../../components/ui/modalform";
import type { LaundryOrderWithDetails } from "../../../../../../hooks/hotel-laundry/orders/useLaundryOrders";

// Temporary type until database types are regenerated
interface LaundryOrderWithInstructions extends LaundryOrderWithDetails {
  special_instructions?: string | null;
}

interface OrderNotesSectionProps {
  order: LaundryOrderWithDetails;
}

export function OrderNotesSection({ order }: OrderNotesSectionProps) {
  const orderWithInstructions = order as LaundryOrderWithInstructions;

  if (!orderWithInstructions.special_instructions) return null;

  return (
    <ModalFormSection title="Special Instructions">
      <ModalFormField
        label="Notes"
        value={orderWithInstructions.special_instructions}
      />
    </ModalFormSection>
  );
}
