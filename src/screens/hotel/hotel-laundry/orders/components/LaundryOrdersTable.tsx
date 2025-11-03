import { useMemo, useState, useCallback } from "react";
import {
  Table,
  type TableColumn,
  StatusBadge,
} from "../../../../../components/ui";
import {
  useLaundryOrders,
  useUpdateLaundryOrderStatus,
  type LaundryOrderWithDetails,
} from "../../../../../hooks/hotel-laundry/orders/useLaundryOrders";
import { useHotelId } from "../../../../../hooks/useHotelContext";
import { LaundryOrderModal } from "./laundry-order-modal";

interface LaundryOrder extends Record<string, unknown> {
  id: string;
  orderId: string;
  services: string;
  guest: string;
  room: string;
  pickup: string;
  delivery: string;
  total: string;
  status: string;
  createdAt: string;
}

interface LaundryOrdersTableProps {
  searchValue?: string;
}

export function LaundryOrdersTable({
  searchValue = "",
}: LaundryOrdersTableProps) {
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const hotelId = useHotelId();
  const [selectedOrder, setSelectedOrder] =
    useState<LaundryOrderWithDetails | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch laundry orders using the hook
  const {
    data: laundryOrders,
    isLoading,
    error,
  } = useLaundryOrders(hotelId || undefined);

  // Debug: Log the fetched data
  console.log("Laundry Orders Data:", laundryOrders);
  console.log("Is Loading:", isLoading);
  console.log("Error:", error);

  const updateStatus = useUpdateLaundryOrderStatus();

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
    async (orderId: string, newStatus: string) => {
      try {
        await updateStatus.mutateAsync({
          id: orderId,
          status: newStatus,
        });
      } catch (error) {
        console.error("Failed to update laundry order status:", error);
      }
    },
    [updateStatus]
  );

  // Handle row click to open details modal
  const handleRowClick = (row: LaundryOrder) => {
    const fullOrder = laundryOrders?.find((order) => order.id === row.id);
    if (fullOrder) {
      setSelectedOrder(fullOrder);
      setIsDetailModalOpen(true);
    }
  };

  // Close detail modal
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  // Handler for sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Define table columns for laundry orders
  const columns: TableColumn<LaundryOrder>[] = useMemo(
    () => [
      {
        key: "orderId",
        label: "Order ID",
        sortable: true,
      },
      {
        key: "services",
        label: "Services",
        sortable: true,
      },
      {
        key: "guest",
        label: "Guest",
        sortable: true,
      },
      {
        key: "room",
        label: "Room",
        sortable: true,
      },
      {
        key: "pickup",
        label: "Pickup",
        sortable: true,
      },
      {
        key: "delivery",
        label: "Delivery",
        sortable: true,
      },
      {
        key: "total",
        label: "Total",
        sortable: true,
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value, row) => (
          <StatusBadge
            status={String(value)}
            statusOptions={orderStatusOptions}
            onStatusChange={(newStatus) =>
              handleStatusChange(row.id, newStatus)
            }
          />
        ),
      },
      {
        key: "createdAt",
        label: "Created At",
        sortable: true,
      },
    ],
    [orderStatusOptions, handleStatusChange]
  );

  // Transform database data to table format with search filtering
  const orderData: LaundryOrder[] = useMemo(() => {
    if (!laundryOrders) {
      return [];
    }

    const filtered = laundryOrders.filter((order: LaundryOrderWithDetails) => {
      if (!searchValue) return true;

      const search = searchValue.toLowerCase();
      const guestName = order.guests?.guest_name?.toLowerCase() || "";
      const roomNumber = order.guests?.room_number?.toLowerCase() || "";

      return (
        order.id.toLowerCase().includes(search) ||
        order.status.toLowerCase().includes(search) ||
        guestName.includes(search) ||
        roomNumber.includes(search)
      );
    });

    const transformed = filtered.map((order: LaundryOrderWithDetails) => {
      const servicesCount = order.laundry_order_items?.length || 0;
      // Temporary type assertion until database types are regenerated
      const orderWithDates = order as LaundryOrderWithDetails & {
        pickup_date?: string;
        delivery_date?: string;
        total_price?: number;
      };

      return {
        id: order.id,
        orderId: order.id.substring(0, 8).toUpperCase(),
        services: `${servicesCount} ${
          servicesCount === 1 ? "service" : "services"
        }`,
        guest: order.guests?.guest_name || "N/A",
        room: order.guests?.room_number || "N/A",
        pickup: orderWithDates.pickup_date
          ? new Date(orderWithDates.pickup_date).toLocaleDateString()
          : "N/A",
        delivery: orderWithDates.delivery_date
          ? new Date(orderWithDates.delivery_date).toLocaleDateString()
          : "N/A",
        total: `$${(orderWithDates.total_price || 0).toFixed(2)}`,
        status: order.status,
        createdAt: order.created_at
          ? new Date(order.created_at).toLocaleString()
          : "N/A",
      };
    });

    // Apply sorting
    if (sortColumn) {
      return [...transformed].sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortColumn];
        const bValue = (b as Record<string, unknown>)[sortColumn];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          const aStr = String(aValue).toLowerCase();
          const bStr = String(bValue).toLowerCase();
          comparison = aStr.localeCompare(bStr);
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return transformed;
  }, [laundryOrders, searchValue, sortColumn, sortDirection]);

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">
          Error loading laundry orders: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {searchValue && (
        <p className="text-sm text-gray-600 mb-4">
          Searching for: "{searchValue}"
        </p>
      )}

      {/* Laundry Orders Table */}
      <Table
        columns={columns}
        data={orderData}
        loading={isLoading}
        emptyMessage="No laundry orders found. Orders will appear here once guests start requesting laundry services."
        onRowClick={handleRowClick}
        itemsPerPage={10}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Order Detail Modal */}
      <LaundryOrderModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
      />
    </div>
  );
}
