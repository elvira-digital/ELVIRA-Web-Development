import { useMemo, useState } from "react";
import {
  Table,
  type TableColumn,
  StatusBadge,
} from "../../../../../components/ui";
import {
  useLaundryServices,
  useUpdateLaundryServiceStatus,
} from "../../../../../hooks/laundry";
import { useHotelId } from "../../../../../hooks/useHotelContext";

interface LaundryService {
  id: string;
  category: string;
  description: string | null;
  price: number;
  is_active: boolean;
}

interface ServiceTableRow extends Record<string, unknown> {
  id: string;
  status: string;
  isActive: boolean;
  category: string;
  description: string;
  price: string;
}

interface ServicesTableProps {
  searchValue: string;
  onView: (service: LaundryService) => void;
}

export function ServicesTable({ searchValue, onView }: ServicesTableProps) {
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const hotelId = useHotelId();

  // Fetch services using the hook
  const {
    data: services,
    isLoading,
    error,
  } = useLaundryServices(hotelId || undefined);

  // Get the status update mutation
  const updateServiceStatus = useUpdateLaundryServiceStatus();

  // Handle row click
  const handleRowClick = (row: ServiceTableRow) => {
    const fullService = services?.find((item) => item.id === row.id);
    if (fullService) {
      onView(fullService);
    }
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

  // Define table columns for services
  const columns: TableColumn<ServiceTableRow>[] = [
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_value, row) => (
        <StatusBadge
          status={row.isActive ? "active" : "inactive"}
          onToggle={async (newStatus) => {
            if (!hotelId) return;
            await updateServiceStatus.mutateAsync({
              id: row.id,
              hotelId,
              isActive: newStatus,
            });
          }}
        />
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
    },
  ];

  // Transform database data to table format with search filtering
  const serviceData: ServiceTableRow[] = useMemo(() => {
    if (!services) {
      return [];
    }

    const filtered = services.filter((service: LaundryService) => {
      if (!searchValue) return true;

      const search = searchValue.toLowerCase();
      return (
        service.category.toLowerCase().includes(search) ||
        (service.description &&
          service.description.toLowerCase().includes(search))
      );
    });

    const transformed = filtered.map((service: LaundryService) => ({
      id: service.id,
      status: service.is_active ? "Active" : "Inactive",
      isActive: service.is_active,
      category: service.category,
      description: service.description || "-",
      price: `$${service.price.toFixed(2)}`,
    }));

    // Apply sorting
    if (sortColumn) {
      return [...transformed].sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortColumn];
        const bValue = (b as Record<string, unknown>)[sortColumn];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        // Special handling for price column
        if (sortColumn === "price") {
          const aNum = parseFloat(String(aValue).replace(/[$,]/g, ""));
          const bNum = parseFloat(String(bValue).replace(/[$,]/g, ""));
          comparison = aNum - bNum;
        } else if (typeof aValue === "number" && typeof bValue === "number") {
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
  }, [services, searchValue, sortColumn, sortDirection]);

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">
          Error loading services: {String(error)}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {searchValue && (
        <p className="text-sm text-gray-600 mb-4">
          Searching for: "{searchValue}" - Found {serviceData.length} result(s)
        </p>
      )}

      {/* Services Table */}
      <Table
        columns={columns}
        data={serviceData}
        loading={isLoading}
        emptyMessage={
          searchValue
            ? `No services found matching "${searchValue}".`
            : "No laundry services found. Add new services to get started."
        }
        onRowClick={handleRowClick}
        itemsPerPage={10}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  );
}
