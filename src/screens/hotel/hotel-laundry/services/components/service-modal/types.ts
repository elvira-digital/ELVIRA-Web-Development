export interface ServiceFormData {
  category: string;
  description: string;
  price: string;
  isActive: boolean;
}

export interface FormErrors {
  category?: string;
  description?: string;
  price?: string;
}

export interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "view";
  service: {
    id: string;
    category: string;
    description: string | null;
    price: number;
    is_active: boolean;
  } | null;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => void;
}
