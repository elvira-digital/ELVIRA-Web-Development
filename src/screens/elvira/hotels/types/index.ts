import type { Database } from "../../../../types/database";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];

export interface HotelFormData {
  // Basic Info
  name: string;
  contactEmail: string;
  phoneNumber: string;
  receptionPhone: string;
  website: string;
  contactName: string;
  contactLastName: string;

  // Location
  city: string;
  zipCode: string;
  country: string;
  address: string;
  latitude: number | null;
  longitude: number | null;

  // Details
  officialLanguages: string[];
  description: string;
  services: string[];
  numberRooms: number | null;
  currency: string;
  membership: string;

  // Other
  isActive: boolean;
}

export interface HotelTableData extends Record<string, unknown> {
  id: string;
  name: string;
  city: string;
  country: string;
  contactEmail: string;
  phoneNumber: string;
  rooms: string;
  membership: string;
  status: string;
  isActive: boolean;
  rawData?: Hotel;
}

export const INITIAL_FORM_DATA: HotelFormData = {
  name: "",
  contactEmail: "",
  phoneNumber: "",
  receptionPhone: "",
  website: "",
  contactName: "",
  contactLastName: "",
  city: "",
  zipCode: "",
  country: "",
  address: "",
  latitude: null,
  longitude: null,
  officialLanguages: [],
  description: "",
  services: [],
  numberRooms: null,
  currency: "EUR",
  membership: "Silver",
  isActive: false,
};
