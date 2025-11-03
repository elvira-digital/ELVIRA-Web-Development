import {
  ModalFormSection,
  ModalFormGrid,
} from "../../../../../../components/ui/modalform";
import { Input } from "../../../../../../components/ui";
import type { ServiceFormData, FormErrors } from "./types";

interface BasicInfoSectionProps {
  formData: ServiceFormData;
  errors: FormErrors;
  mode: "create" | "edit" | "view";
  onChange: (field: keyof ServiceFormData, value: string) => void;
}

export function BasicInfoSection({
  formData,
  errors,
  mode,
  onChange,
}: BasicInfoSectionProps) {
  const disabled = mode === "view";

  return (
    <ModalFormSection title="Service Information">
      <ModalFormGrid columns={2}>
        <Input
          label="Category"
          value={formData.category}
          onChange={(e) => onChange("category", e.target.value)}
          error={errors.category}
          disabled={disabled}
          placeholder="e.g., Shirt, Pants, Dress"
          required
        />

        <Input
          label="Price"
          type="number"
          value={formData.price}
          onChange={(e) => onChange("price", e.target.value)}
          error={errors.price}
          disabled={disabled}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
      </ModalFormGrid>
    </ModalFormSection>
  );
}
