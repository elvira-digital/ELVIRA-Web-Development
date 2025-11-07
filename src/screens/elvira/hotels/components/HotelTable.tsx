import { useMemo } from "react";
import {
  DataTable,
  type TableColumn,
  StatusBadge,
} from "../../../../components/ui";
import { useUpdateHotel } from "../../../../hooks/elvira/useHotels";
import type { HotelTableData } from "../types";
import type { Database } from "../../../../types/database";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];

interface HotelTableProps {
  hotels: Hotel[];
  isLoading: boolean;
  error: Error | null;
  searchValue: string;
  onViewHotel: (hotel: Hotel) => void;
}

export function HotelTable({
  hotels,
  isLoading,
  error,
  searchValue,
  onViewHotel,
}: HotelTableProps) {
  const updateHotel = useUpdateHotel();

  // Define table columns
  const columns: TableColumn<HotelTableData>[] = [
    {
      key: "name",
      label: "Hotel Name",
      sortable: true,
    },
    {
      key: "city",
      label: "City",
      sortable: true,
    },
    {
      key: "country",
      label: "Country",
      sortable: true,
    },
    {
      key: "contactEmail",
      label: "Email",
      sortable: true,
    },
    {
      key: "phoneNumber",
      label: "Phone",
      sortable: true,
    },
    {
      key: "rooms",
      label: "Rooms",
      sortable: true,
    },
    {
      key: "membership",
      label: "Membership",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === "Premium"
              ? "bg-emerald-100 text-emerald-800"
              : value === "Gold"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_value, row) => (
        <StatusBadge
          status={row.isActive ? "active" : "inactive"}
          onToggle={async (newStatus) => {
            await updateHotel.mutateAsync({
              id: row.id,
              updates: { is_active: newStatus },
            });
          }}
        />
      ),
    },
  ];

  // Transform raw data into table format
  const transformData = useMemo(
    () => (data: Hotel[]) => {
      if (!data) return [];

      return data.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.city || "N/A",
        country: hotel.country || "N/A",
        contactEmail: hotel.contact_email,
        phoneNumber: hotel.phone_number || "N/A",
        rooms: hotel.number_rooms?.toString() || "N/A",
        membership: hotel.membership,
        status: hotel.is_active ? "Active" : "Inactive",
        isActive: hotel.is_active,
        rawData: hotel,
      })) as HotelTableData[];
    },
    []
  );

  return (
    <DataTable
      data={hotels}
      isLoading={isLoading}
      error={error}
      columns={columns}
      searchValue={searchValue}
      searchFields={["name", "city", "country", "contactEmail", "phoneNumber"]}
      transformData={transformData}
      emptyMessage="No hotels found. Add your first hotel to get started."
      loadingMessage="Loading hotels..."
      errorTitle="Failed to load hotels"
      showSummary
      summaryLabel="Total hotels"
      showPagination
      itemsPerPage={10}
      onRowClick={(row) => onViewHotel(row.rawData as Hotel)}
    />
  );
}
