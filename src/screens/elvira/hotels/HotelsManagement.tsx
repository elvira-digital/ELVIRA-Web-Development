import { useState } from "react";
import {
  PageContent,
  PageHeader,
  PageToolbar,
  TableContainer,
} from "../../../components/shared/page-layouts";
import { ConfirmationModal } from "../../../components/ui";
import { useHotels, useDeleteHotel } from "../../../hooks/elvira/useHotels";
import { useCreateHotelWithOwner } from "../../../hooks/elvira/useCreateHotelWithOwner";
import { HotelTable, HotelModal } from "./components";
import type { HotelFormData } from "./types";
import type { Database } from "../../../types/database";
import {
  getCountryCode,
  getCountryName,
  convertLanguagesToCodes,
  convertLanguagesToNames,
} from "../../../utils/countryMapping";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];

export function HotelsManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [isAddHotelModalOpen, setIsAddHotelModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Fetch hotels data
  const { data: hotels = [], isLoading, error } = useHotels();

  // Mutations
  const createHotelWithOwner = useCreateHotelWithOwner();
  const deleteHotel = useDeleteHotel();

  const handleSearchClear = () => {
    setSearchValue("");
  };

  // Handle add hotel
  const handleAddHotel = async (data: HotelFormData) => {
    try {
      await createHotelWithOwner.mutateAsync({
        hotel: {
          name: data.name,
          contact_email: data.contactEmail,
          phone_number: data.phoneNumber,
          reception_phone: data.receptionPhone,
          website: data.website,
          city: data.city,
          zip_code: data.zipCode,
          country: getCountryName(data.country),
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          official_languages: convertLanguagesToNames(data.officialLanguages),
          description: data.description,
          services: data.services,
          number_rooms: data.numberRooms,
          currency: data.currency,
          membership: data.membership,
          is_active: data.isActive,
          contact_name: data.contactName,
          contact_last_name: data.contactLastName,
        },
      });

      // Close modal on success
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error creating hotel:", error);
      // Error will be handled by the modal
      throw error;
    }
  };

  // Handle view hotel
  const handleViewHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setModalMode("view");
    setIsAddHotelModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsAddHotelModalOpen(false);
    setSelectedHotel(null);
    setModalMode("create");
  };

  // Handle edit button click in modal footer
  const handleEdit = () => {
    setModalMode("edit");
  };

  // Handle delete button click in modal footer
  const handleDelete = () => {
    setIsAddHotelModalOpen(false);
    setIsDeleteConfirmOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (selectedHotel) {
      try {
        await deleteHotel.mutateAsync(selectedHotel.id);
        setIsDeleteConfirmOpen(false);
        handleCloseModal();
      } catch (error) {
        console.error("Error deleting hotel:", error);
      }
    }
  };

  // Transform hotel data to form format
  const getHotelFormData = (): HotelFormData | null => {
    if (!selectedHotel || modalMode === "create") return null;

    // These fields exist in the database but not in generated types yet
    const hotelWithNewFields = selectedHotel as Hotel & {
      contact_name?: string | null;
      contact_last_name?: string | null;
    };

    console.log("🔍 Loading hotel data:", {
      name: selectedHotel.name,
      country: selectedHotel.country,
      official_languages: selectedHotel.official_languages,
      official_languages_converted: convertLanguagesToCodes(
        selectedHotel.official_languages || []
      ),
      contact_name: hotelWithNewFields.contact_name,
      contact_last_name: hotelWithNewFields.contact_last_name,
    });

    return {
      name: selectedHotel.name,
      contactEmail: selectedHotel.contact_email,
      phoneNumber: selectedHotel.phone_number || "",
      receptionPhone: selectedHotel.reception_phone || "",
      website: selectedHotel.website || "",
      contactName: hotelWithNewFields.contact_name || "",
      contactLastName: hotelWithNewFields.contact_last_name || "",
      city: selectedHotel.city || "",
      zipCode: selectedHotel.zip_code || "",
      country: getCountryCode(selectedHotel.country), // Convert full name to code for form
      address: selectedHotel.address || "",
      latitude: selectedHotel.latitude,
      longitude: selectedHotel.longitude,
      officialLanguages: convertLanguagesToCodes(
        selectedHotel.official_languages || []
      ), // Convert names to codes for form
      description: selectedHotel.description || "",
      services: selectedHotel.services || [],
      numberRooms: selectedHotel.number_rooms,
      currency: selectedHotel.currency || "EUR",
      membership: selectedHotel.membership,
      isActive: selectedHotel.is_active,
    };
  };

  return (
    <PageContent>
      <PageHeader
        title="Hotels"
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        }
      />

      <PageToolbar
        description="Manage all hotels in the Elvira system, view hotel details, and monitor their status."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search hotels by name, city, or email..."
        onSearchClear={handleSearchClear}
        buttonLabel="Add Hotel"
        onButtonClick={() => setIsAddHotelModalOpen(true)}
      />

      <TableContainer>
        <HotelTable
          hotels={hotels}
          isLoading={isLoading}
          error={error}
          searchValue={searchValue}
          onViewHotel={handleViewHotel}
        />
      </TableContainer>

      {/* Add/Edit/View Hotel Modal */}
      <HotelModal
        isOpen={isAddHotelModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddHotel}
        mode={modalMode}
        hotel={getHotelFormData()}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={createHotelWithOwner.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Hotel"
        message={`Are you sure you want to delete ${
          selectedHotel?.name || ""
        }? This action cannot be undone and will remove the hotel from the system permanently.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteHotel.isPending}
      />
    </PageContent>
  );
}
