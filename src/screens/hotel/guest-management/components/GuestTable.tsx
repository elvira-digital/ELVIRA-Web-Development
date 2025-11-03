import { useMemo } from "react";
import {
  DataTable,
  type TableColumn,
  StatusBadge,
} from "../../../../components/ui";
import {
  useUpdateGuest,
  type GuestWithPersonalData,
} from "../../../../hooks/guest-management/useGuests";
import type { GuestTableData } from "../types";
import {
  getCountryName,
  getLanguageName,
} from "../../../../utils/localization";

interface GuestTableProps {
  guests: GuestWithPersonalData[];
  isLoading: boolean;
  error: Error | null;
  searchValue: string;
  onViewGuest: (guest: GuestWithPersonalData) => void;
}

export function GuestTable({
  guests,
  isLoading,
  error,
  searchValue,
  onViewGuest,
}: GuestTableProps) {
  const updateGuest = useUpdateGuest();

  // Define table columns
  const columns: TableColumn<GuestTableData>[] = [
    {
      key: "room",
      label: "Room",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_value, row) => (
        <StatusBadge
          status={row.isActive ? "active" : "inactive"}
          onToggle={async (newStatus) => {
            await updateGuest.mutateAsync({
              id: row.id,
              updates: { is_active: newStatus },
            });
          }}
        />
      ),
    },
    {
      key: "dnd",
      label: "DND",
      sortable: true,
    },
    {
      key: "firstName",
      label: "First Name",
      sortable: true,
    },
    {
      key: "lastName",
      label: "Last Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
    },
    {
      key: "country",
      label: "Country",
      sortable: true,
    },
    {
      key: "language",
      label: "Language",
      sortable: true,
    },
  ];

  // Transform raw data into table format
  const transformData = useMemo(
    () => (data: GuestWithPersonalData[]) => {
      if (!data) return [];

      return data.map((guest) => ({
        id: guest.id,
        room: guest.room_number,
        status: guest.is_active ? "Active" : "Inactive",
        isActive: guest.is_active,
        dnd: guest.dnd_status ? "Yes" : "No",
        firstName: guest.guest_personal_data?.first_name || "N/A",
        lastName: guest.guest_personal_data?.last_name || "N/A",
        email: guest.guest_personal_data?.guest_email || "N/A",
        phone: guest.guest_personal_data?.phone_number || "N/A",
        country: getCountryName(guest.guest_personal_data?.country),
        language: getLanguageName(guest.guest_personal_data?.language),
        rawData: guest,
      })) as GuestTableData[];
    },
    []
  );

  return (
    <DataTable
      data={guests}
      isLoading={isLoading}
      error={error}
      columns={columns}
      searchValue={searchValue}
      searchFields={["firstName", "lastName", "email", "room", "phone"]}
      transformData={transformData}
      emptyMessage="No guests found. Guest information will appear here once check-ins begin."
      loadingMessage="Loading guests..."
      errorTitle="Failed to load guests"
      showSummary
      summaryLabel="Total guests"
      showPagination
      itemsPerPage={10}
      onRowClick={(row) => onViewGuest(row.rawData as GuestWithPersonalData)}
    />
  );
}
