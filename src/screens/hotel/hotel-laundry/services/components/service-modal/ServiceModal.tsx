import { useEffect, useState } from "react";
import {
  ModalForm,
  ModalFormActions,
} from "../../../../../../components/ui/modalform";
import { BasicInfoSection } from "./BasicInfoSection";
import { DescriptionSection } from "./DescriptionSection";
import type { ServiceFormData, FormErrors, ServiceModalProps } from "./types";

export function ServiceModal({
  isOpen,
  onClose,
  mode,
  service,
  onSubmit,
  onEdit,
  onDelete,
}: ServiceModalProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    category: "",
    description: "",
    price: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isPending, setIsPending] = useState(false);

  // Reset form when modal opens/closes or service changes
  useEffect(() => {
    if (isOpen && service) {
      setFormData({
        category: service.category || "",
        description: service.description || "",
        price: service.price?.toString() || "",
        isActive: service.is_active,
      });
    } else if (isOpen && !service) {
      setFormData({
        category: "",
        description: "",
        price: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [service, isOpen]);

  const handleFieldChange = (
    field: keyof ServiceFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (mode === "view") return;

    if (!validateForm()) return;

    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsPending(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Add Laundry Service";
      case "edit":
        return "Edit Laundry Service";
      case "view":
        return "Service Details";
      default:
        return "Service";
    }
  };

  const getSubmitLabel = () => {
    return mode === "edit" ? "Save Changes" : "Add Service";
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="lg"
      footer={
        <ModalFormActions
          mode={mode}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isPending={isPending}
          submitLabel={getSubmitLabel()}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      }
    >
      <BasicInfoSection
        formData={formData}
        errors={errors}
        mode={mode}
        onChange={handleFieldChange}
      />

      <DescriptionSection
        formData={formData}
        errors={errors}
        mode={mode}
        onChange={handleFieldChange}
      />
    </ModalForm>
  );
}
