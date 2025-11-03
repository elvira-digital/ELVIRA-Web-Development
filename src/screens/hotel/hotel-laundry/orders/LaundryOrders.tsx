import { LaundryOrdersTable } from "./components";
import { OrdersPageHeader } from "../../../../components/shared";

interface LaundryOrdersProps {
  searchValue: string;
}

export function LaundryOrders({ searchValue }: LaundryOrdersProps) {
  return (
    <div className="p-6">
      <OrdersPageHeader
        title="Laundry Orders"
        description="Track and manage guest laundry service orders."
      />

      <LaundryOrdersTable searchValue={searchValue} />
    </div>
  );
}
