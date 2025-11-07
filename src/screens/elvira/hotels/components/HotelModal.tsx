import { useState, useEffect } from "react";
import { ModalForm, ModalFormActions } from "../../../../components/ui";
import { HotelFormFields } from "./HotelFormFields";
import type { HotelFormData } from "../types";
import { INITIAL_FORM_DATA } from "../types";

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HotelFormData) => void;
  mode: "create" | "edit" | "view";
  hotel?: HotelFormData | null;
  onEdit?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function HotelModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  hotel,
  onEdit,
  onDelete,
  isLoading = false,
}: HotelModalProps) {
  const [formData, setFormData] = useState<HotelFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or hotel changes
  useEffect(() => {
    if (isOpen) {
      if (hotel && mode !== "create") {
        setFormData(hotel);
      } else {
        setFormData(INITIAL_FORM_DATA);
      }
      setErrors({});
    }
  }, [isOpen, hotel, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Hotel name is required";
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Invalid email format";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (mode === "view") return;

    if (validateForm()) {
      setIsSubmitting(true);
      setErrors({});
      try {
        await onSubmit(formData);
        // Modal will be closed by parent on success
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setErrors({ submit: errorMessage });
        setIsSubmitting(false);
      }
    }
  };

  const handleFieldChange = (field: keyof HotelFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Add New Hotel";
      case "edit":
        return "Edit Hotel";
      case "view":
        return "Hotel Details";
      default:
        return "Hotel";
    }
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="xl"
      footer={
        <ModalFormActions
          mode={mode}
          onCancel={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
          onSubmit={handleSubmit}
          submitLabel={mode === "create" ? "Add Hotel" : "Save Changes"}
          isLoading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading}
        />
      }
    >
      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
        {isSubmitting && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-600">
              {mode === "create"
                ? "Creating hotel and owner account... This may take a moment."
                : "Saving changes..."}
            </p>
          </div>
        )}
        <HotelFormFields
          formData={formData}
          errors={errors}
          onChange={handleFieldChange}
          mode={mode}
        />
      </form>
    </ModalForm>
  );
}
