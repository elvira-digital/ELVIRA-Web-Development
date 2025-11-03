import { useMemo, useCallback, useState, useEffect } from "react";
import {
  ModalFormSection,
  ModalFormField,
  StatusBadge,
} from "../../../../../../components/ui";
import { useUpdateLaundryOrderStatus } from "../../../../../../hooks/hotel-laundry/orders/useLaundryOrders";
import type { LaundryOrderWithDetails } from "../../../../../../hooks/hotel-laundry/orders/useLaundryOrders";

interface OrderInfoSectionProps {
  order: LaundryOrderWithDetails;
}

export function OrderInfoSection({ order }: OrderInfoSectionProps) {
  const updateStatus = useUpdateLaundryOrderStatus();

  // Local state for optimistic updates
  const [currentStatus, setCurrentStatus] = useState(order.status);

  // Sync local state when order prop changes
  useEffect(() => {
    setCurrentStatus(order.status);
  }, [order.status]);

  // Status options for laundry orders (memoized)
  const orderStatusOptions = useMemo(
    () => [
      "pending",
      "confirmed",
      "picked_up",
      "in_progress",
      "ready",
      "delivered",
      "cancelled",
    ],
    []
  );

  // Handle status change (wrapped in useCallback)
  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      // Optimistic update
      setCurrentStatus(newStatus);

      try {
        await updateStatus.mutateAsync({
          id: order.id,
          status: newStatus,
        });
      } catch (error) {
        console.error("Failed to update laundry order status:", error);
        // Revert on error
        setCurrentStatus(order.status);
      }
    },
    [updateStatus, order.id, order.status]
  );

  return (
    <ModalFormSection title="Order Information">
      <div className="grid grid-cols-2 gap-4">
        <ModalFormField
          label="Order ID"
          value={order.id.substring(0, 8).toUpperCase()}
        />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-700 mb-1">Status</span>
          <StatusBadge
            status={currentStatus}
            statusOptions={orderStatusOptions}
            onStatusChange={handleStatusChange}
          />
        </div>
        <ModalFormField
          label="Guest"
          value={order.guests?.guest_name || "N/A"}
        />
        <ModalFormField
          label="Room"
          value={order.guests?.room_number || "N/A"}
        />
        <ModalFormField
          label="Total Amount"
          value={`$${order.total_price?.toFixed(2) || "0.00"}`}
        />
        <ModalFormField
          label="Created At"
          value={
            order.created_at
              ? new Date(order.created_at).toLocaleString()
              : "N/A"
          }
        />
      </div>
    </ModalFormSection>
  );
}
