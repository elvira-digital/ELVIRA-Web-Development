import { useState } from "react";
import {
  useGuests,
  useDeleteGuest,
  type GuestWithPersonalData,
} from "../../../hooks/guest-management/useGuests";
import { useHotelContext } from "../../../hooks/useHotelContext";
import { ConfirmationModal } from "../../../components/ui";
import {
  PageContent,
  PageHeader,
  PageToolbar,
  TableContainer,
} from "../../../components/shared/page-layouts";
import { AddGuestModal, GuestTable } from "./components";
import type { GuestFormData } from "./types";

interface GuestManagementProps {
  searchValue?: string;
}

export function GuestManagement({
  searchValue: externalSearchValue,
}: GuestManagementProps) {
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] =
    useState<GuestWithPersonalData | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Get hotel ID from context
  const { hotelId } = useHotelContext();

  // Fetch guests data
  const {
    data: guests = [],
    isLoading,
    error,
  } = useGuests(hotelId || undefined);

  // Delete guest hook
  const deleteGuest = useDeleteGuest();

  // Use external search value if provided (for tab-based usage), otherwise use internal state
  const searchValue =
    externalSearchValue !== undefined
      ? externalSearchValue
      : internalSearchValue;
  const setSearchValue =
    externalSearchValue !== undefined ? () => {} : setInternalSearchValue;

  const handleSearchClear = () => {
    setSearchValue("");
  };

  // Handle add guest
  const handleAddGuest = (data: GuestFormData) => {
    // TODO: Connect to database
    console.log("Guest data to be saved:", data);
  };

  // Handle view guest
  const handleViewGuest = (guest: GuestWithPersonalData) => {
    setSelectedGuest(guest);
    setModalMode("view");
    setIsAddGuestModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsAddGuestModalOpen(false);
    setSelectedGuest(null);
    setModalMode("create");
  };

  // Handle edit button click in modal footer
  const handleEdit = () => {
    setModalMode("edit");
  };

  // Handle delete button click in modal footer
  const handleDelete = () => {
    setIsAddGuestModalOpen(false);
    setIsDeleteConfirmOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (selectedGuest && hotelId) {
      try {
        await deleteGuest.mutateAsync({
          id: selectedGuest.id,
          hotelId,
        });
        setIsDeleteConfirmOpen(false);
        handleCloseModal();
      } catch (error) {
        console.error("Error deleting guest:", error);
      }
    }
  };

  // Transform guest data to form format
  const getGuestFormData = (): GuestFormData | null => {
    if (!selectedGuest || modalMode === "create") return null;

    return {
      roomNumber: selectedGuest.room_number,
      checkoutDate: selectedGuest.access_code_expires_at?.split("T")[0] || "",
      guests: [
        {
          id: selectedGuest.id,
          accessCode: "", // Don't show existing code for security
          firstName: selectedGuest.guest_personal_data?.first_name || "",
          lastName: selectedGuest.guest_personal_data?.last_name || "",
          email: selectedGuest.guest_personal_data?.guest_email || "",
          phoneNumber: selectedGuest.guest_personal_data?.phone_number || "",
          dateOfBirth: selectedGuest.guest_personal_data?.date_of_birth || "",
          country: selectedGuest.guest_personal_data?.country || "",
          language: selectedGuest.guest_personal_data?.language || "",
        },
      ],
    };
  };

  return (
    <PageContent>
      <PageHeader
        title="Guest Management"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
      />

      {/* Toolbar with Search and Actions */}
      <PageToolbar
        description="Manage hotel guests, track room assignments, and monitor guest preferences and status."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search guests by name, room, or email..."
        onSearchClear={handleSearchClear}
        buttonLabel="Add Guest"
        onButtonClick={() => setIsAddGuestModalOpen(true)}
      />

      {/* Guest Management Table */}
      <TableContainer>
        <GuestTable
          guests={guests}
          isLoading={isLoading}
          error={error}
          searchValue={searchValue}
          onViewGuest={handleViewGuest}
        />
      </TableContainer>

      {/* Add/Edit/View Guest Modal */}
      <AddGuestModal
        isOpen={isAddGuestModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddGuest}
        mode={modalMode}
        guest={getGuestFormData()}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Guest"
        message={`Are you sure you want to delete ${
          selectedGuest?.guest_personal_data?.first_name || ""
        } ${
          selectedGuest?.guest_personal_data?.last_name || ""
        }? This action cannot be undone and will remove the guest from the system permanently.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteGuest.isPending}
      />
    </PageContent>
  );
}
