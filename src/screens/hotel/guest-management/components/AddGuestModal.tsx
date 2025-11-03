import { useState } from "react";
import {
  ModalForm,
  ModalFormActions,
  ModalFormSection,
  ModalFormGrid,
  Input,
} from "../../../../components/ui";
import { GuestFormFields } from "./GuestFormFields";
import { GuestNavigation } from "./GuestNavigation";
import type { GuestFormData, GuestInfo } from "../types";
import { INITIAL_GUEST_INFO, INITIAL_FORM_DATA } from "../types";
import {
  createGuestSession,
  validateGuestForm,
} from "../../../../services/guest-service";
import { useCurrentUserHotelId } from "../../../../hooks/useCurrentUserHotel";

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GuestFormData) => void;
  mode?: "create" | "edit" | "view";
  guest?: GuestFormData | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AddGuestModal({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  guest = null,
  onEdit,
  onDelete,
}: AddGuestModalProps) {
  const { hotelId } = useCurrentUserHotelId();
  const [formData, setFormData] = useState<GuestFormData>(
    guest || INITIAL_FORM_DATA
  );
  const [currentGuestIndex, setCurrentGuestIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isViewMode = mode === "view";

  const modalTitle =
    mode === "create"
      ? "Add Guest"
      : mode === "edit"
      ? "Edit Guest"
      : "Guest Details";

  const handleInputChange = (field: keyof GuestFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGuestChange = (
    index: number,
    field: keyof GuestInfo,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedGuests = [...prev.guests];
      updatedGuests[index] = {
        ...updatedGuests[index],
        [field]: value,
      };
      return {
        ...prev,
        guests: updatedGuests,
      };
    });
  };

  const handleAddGuest = () => {
    const newGuestId = String(formData.guests.length + 1);
    setFormData((prev) => ({
      ...prev,
      guests: [...prev.guests, { ...INITIAL_GUEST_INFO, id: newGuestId }],
    }));
    setCurrentGuestIndex(formData.guests.length);
  };

  const handleRemoveGuest = () => {
    if (formData.guests.length <= 1) return; // Don't remove if it's the last guest

    setFormData((prev) => {
      const updatedGuests = prev.guests.filter(
        (_, index) => index !== currentGuestIndex
      );
      return {
        ...prev,
        guests: updatedGuests,
      };
    });

    // Adjust current index if necessary
    if (currentGuestIndex >= formData.guests.length - 1) {
      setCurrentGuestIndex(Math.max(0, formData.guests.length - 2));
    }
  };

  const handlePreviousGuest = () => {
    if (currentGuestIndex > 0) {
      setCurrentGuestIndex(currentGuestIndex - 1);
    }
  };

  const handleNextGuest = () => {
    if (currentGuestIndex < formData.guests.length - 1) {
      setCurrentGuestIndex(currentGuestIndex + 1);
    }
  };

  const handleGenerateAccessCode = (guestIndex: number) => {
    // Generate a random 6-digit code for specific guest
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    handleGuestChange(guestIndex, "accessCode", code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Validate form data
      const validation = validateGuestForm(formData);
      if (!validation.isValid) {
        setErrorMessage(validation.errors.join(", "));
        setIsSubmitting(false);
        return;
      }

      // Check if hotel ID is available
      if (!hotelId) {
        setErrorMessage("Hotel ID not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      // Create guest session
      const result = await createGuestSession({
        hotelId,
        formData,
      });

      console.log("✅ Guest session created:", result);

      // Call parent's onSubmit callback
      onSubmit(formData);

      // Reset form
      setFormData(INITIAL_FORM_DATA);
      setCurrentGuestIndex(0);
      onClose();
    } catch (error) {
      console.error("❌ Error creating guests:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create guests"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form on close
    setFormData(guest || INITIAL_FORM_DATA);
    setCurrentGuestIndex(0);
    onClose();
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="lg"
      footer={
        <ModalFormActions
          mode={mode}
          onCancel={handleClose}
          onEdit={onEdit}
          onDelete={onDelete}
          onSubmit={() => {
            const form = document.querySelector("form");
            if (form) {
              form.requestSubmit();
            }
          }}
          isPending={isSubmitting}
          submitLabel={mode === "create" ? "Add Guest" : "Update Guest"}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Room Information Section */}
        <ModalFormSection title="Room Information">
          <ModalFormGrid columns={2}>
            <Input
              label="Room Number"
              placeholder="Enter room number"
              value={formData.roomNumber}
              onChange={(e) => handleInputChange("roomNumber", e.target.value)}
              required
              disabled={isViewMode}
            />
            <Input
              label="Checkout Date"
              type="date"
              placeholder="dd/mm/aaaa"
              value={formData.checkoutDate}
              onChange={(e) =>
                handleInputChange("checkoutDate", e.target.value)
              }
              required
              disabled={isViewMode}
            />
          </ModalFormGrid>
        </ModalFormSection>

        {/* Guest Navigation */}
        {!isViewMode && (
          <GuestNavigation
            currentGuestIndex={currentGuestIndex}
            totalGuests={formData.guests.length}
            guests={formData.guests}
            onPreviousGuest={handlePreviousGuest}
            onNextGuest={handleNextGuest}
            onAddGuest={handleAddGuest}
            onRemoveGuest={handleRemoveGuest}
          />
        )}

        {/* Guest Information Section */}
        <ModalFormSection title={`Guest ${currentGuestIndex + 1} Information`}>
          <GuestFormFields
            guest={formData.guests[currentGuestIndex]}
            guestIndex={currentGuestIndex}
            totalGuests={formData.guests.length}
            onGuestChange={handleGuestChange}
            isViewMode={isViewMode}
            onGenerateCode={handleGenerateAccessCode}
          />
        </ModalFormSection>
      </form>
    </ModalForm>
  );
}
