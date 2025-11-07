import { useState } from "react";
import {
  PageContent,
  PageHeader,
  PageToolbar,
  TableContainer,
} from "../../../components/shared/page-layouts";

export function EmployeesManagement() {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchClear = () => {
    setSearchValue("");
  };

  const handleAddEmployee = () => {
    console.log("Add employee clicked");
  };

  return (
    <PageContent>
      <PageHeader
        title="Elvira Employees"
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        }
      />

      <PageToolbar
        description="Manage Elvira system employees and their access permissions."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search employees by name or email..."
        onSearchClear={handleSearchClear}
        buttonLabel="Add Employee"
        onButtonClick={handleAddEmployee}
      />

      <TableContainer>
        <div className="text-center py-12 text-gray-500">
          No employees data yet
        </div>
      </TableContainer>
    </PageContent>
  );
}
