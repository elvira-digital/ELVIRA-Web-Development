import type { GuestWithPersonalData } from "../../../hooks/guest-management/useGuests";

export interface GuestFormData {
  // Basic Info
  roomNumber: string;
  checkoutDate: string;

  // Personal Info (per guest)
  guests: GuestInfo[];
}

export interface GuestInfo {
  id: string; // Temporary ID for form management
  accessCode: string; // Each guest has their own unique 6-digit code
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  language: string;
}

export interface GuestTableData extends Record<string, unknown> {
  id: string;
  room: string;
  status: string;
  isActive: boolean;
  dnd: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  rawData?: GuestWithPersonalData; // Store original guest data for modals
}

export const INITIAL_GUEST_INFO: GuestInfo = {
  id: "",
  accessCode: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  country: "",
  language: "",
};

export const INITIAL_FORM_DATA: GuestFormData = {
  roomNumber: "",
  checkoutDate: "",
  guests: [{ ...INITIAL_GUEST_INFO, id: "1" }],
};
