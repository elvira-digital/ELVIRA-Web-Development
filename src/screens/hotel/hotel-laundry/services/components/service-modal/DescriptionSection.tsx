import { ModalFormSection } from "../../../../../../components/ui/modalform";
import { Textarea } from "../../../../../../components/ui";
import type { ServiceFormData, FormErrors } from "./types";

interface DescriptionSectionProps {
  formData: ServiceFormData;
  errors: FormErrors;
  mode: "create" | "edit" | "view";
  onChange: (field: keyof ServiceFormData, value: string) => void;
}

export function DescriptionSection({
  formData,
  errors,
  mode,
  onChange,
}: DescriptionSectionProps) {
  const disabled = mode === "view";

  return (
    <ModalFormSection title="Description">
      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => onChange("description", e.target.value)}
        error={errors.description}
        disabled={disabled}
        placeholder="Add details about this laundry service..."
        rows={4}
      />
    </ModalFormSection>
  );
}
