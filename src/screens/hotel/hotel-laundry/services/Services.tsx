import { useState } from "react";
import {
  ServicesTable,
  ServiceModal,
  type ServiceFormData,
} from "./components";
import { ManagementPageHeader } from "../../../../components/shared";
import { ConfirmationModal } from "../../../../components/ui";
import {
  useCreateLaundryService,
  useUpdateLaundryService,
  useDeleteLaundryService,
} from "../../../../hooks/laundry";
import { useHotelId } from "../../../../hooks";
import { useAuth } from "../../../../hooks";

type ModalMode = "create" | "edit" | "view";

interface LaundryService {
  id: string;
  category: string;
  description: string | null;
  price: number;
  is_active: boolean;
}

interface ServicesProps {
  searchValue: string;
}

export function Services({ searchValue }: ServicesProps) {
  const hotelId = useHotelId();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedService, setSelectedService] = useState<LaundryService | null>(
    null
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<LaundryService | null>(
    null
  );

  const createService = useCreateLaundryService();
  const updateService = useUpdateLaundryService();
  const deleteService = useDeleteLaundryService();
  const handleAdd = () => {
    setSelectedService(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleView = (service: LaundryService) => {
    setSelectedService(service);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleEditFromView = () => {
    setModalMode("edit");
  };

  const handleDelete = (service?: LaundryService) => {
    const itemToDelete = service || selectedService;
    if (itemToDelete) {
      setServiceToDelete(itemToDelete);
      setIsModalOpen(false);
      setIsDeleteConfirmOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!serviceToDelete || !hotelId) return;

    try {
      await deleteService.mutateAsync({
        id: serviceToDelete.id,
        hotelId,
      });
      setIsDeleteConfirmOpen(false);
      setServiceToDelete(null);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleSubmit = async (data: ServiceFormData) => {
    if (!hotelId || !user?.id) return;

    if (modalMode === "create") {
      await createService.mutateAsync({
        hotel_id: hotelId,
        category: data.category.trim(),
        description: data.description.trim() || null,
        price: parseFloat(data.price),
        is_active: true,
        created_by: user.id,
      });
    } else if (modalMode === "edit" && selectedService) {
      await updateService.mutateAsync({
        id: selectedService.id,
        hotelId,
        updates: {
          category: data.category.trim(),
          description: data.description.trim() || null,
          price: parseFloat(data.price),
        },
      });
    }
  };

  return (
    <div className="p-6">
      <ManagementPageHeader
        title="Laundry Services Management"
        description="Manage laundry service categories, descriptions, and pricing."
        buttonLabel="Add Service"
        onButtonClick={handleAdd}
      />

      <ServicesTable searchValue={searchValue} onView={handleView} />

      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        service={selectedService}
        onSubmit={handleSubmit}
        onEdit={modalMode === "view" ? handleEditFromView : undefined}
        onDelete={modalMode === "view" ? () => handleDelete() : undefined}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.category}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
