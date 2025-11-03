import type { LaundryOrderWithDetails } from "../../../../../../hooks/hotel-laundry/orders/useLaundryOrders";

export interface LaundryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: LaundryOrderWithDetails | null;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}
