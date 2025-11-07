import {
  Input,
  Textarea,
  Select,
  AddressAutocomplete,
  ModalFormSection,
  ModalFormGrid,
} from "../../../../components/ui";
import {
  COUNTRY_OPTIONS,
  LANGUAGE_OPTIONS,
} from "../../../hotel/guest-management/constants";
import type { HotelFormData } from "../types";

interface HotelFormFieldsProps {
  formData: HotelFormData;
  errors: Record<string, string>;
  onChange: (field: keyof HotelFormData, value: unknown) => void;
  mode: "create" | "edit" | "view";
}

export function HotelFormFields({
  formData,
  errors,
  onChange,
  mode,
}: HotelFormFieldsProps) {
  const isReadOnly = mode === "view";

  const membershipOptions = [
    { value: "Silver", label: "Silver" },
    { value: "Gold", label: "Gold" },
    { value: "Premium", label: "Premium" },
  ];

  const currencyOptions = [
    { value: "EUR", label: "EUR (€)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
  ];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <ModalFormSection title="Basic Information">
        <ModalFormGrid columns={2}>
          <div className="md:col-span-2">
            <Input
              label="Hotel Name"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              error={errors.name}
              required
              disabled={isReadOnly}
              placeholder="Enter hotel name"
            />
          </div>

          <Input
            label="Contact Email"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => onChange("contactEmail", e.target.value)}
            error={errors.contactEmail}
            required
            disabled={isReadOnly}
            placeholder="contact@hotel.com"
          />

          <Input
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            disabled={isReadOnly}
            placeholder="+1 234 567 8900"
          />

          <Input
            label="Reception Phone"
            value={formData.receptionPhone}
            onChange={(e) => onChange("receptionPhone", e.target.value)}
            disabled={isReadOnly}
            placeholder="+1 234 567 8901"
          />

          <Input
            label="Website"
            value={formData.website}
            onChange={(e) => onChange("website", e.target.value)}
            disabled={isReadOnly}
            placeholder="https://www.hotel.com"
          />

          <Input
            label="Contact First Name"
            value={formData.contactName}
            onChange={(e) => onChange("contactName", e.target.value)}
            disabled={isReadOnly}
            placeholder="John"
          />

          <Input
            label="Contact Last Name"
            value={formData.contactLastName}
            onChange={(e) => onChange("contactLastName", e.target.value)}
            disabled={isReadOnly}
            placeholder="Doe"
          />
        </ModalFormGrid>
      </ModalFormSection>

      {/* Location Information */}
      <ModalFormSection title="Location">
        <ModalFormGrid columns={2}>
          <div className="md:col-span-2">
            <AddressAutocomplete
              id="hotel-address-autocomplete"
              label="Address"
              value={formData.address}
              onChange={(value) => onChange("address", value)}
              onPlaceSelected={(place) => {
                // Auto-fill all location fields when an address is selected
                onChange("address", place.address);
                if (place.city) onChange("city", place.city);
                if (place.country) onChange("country", place.country);
                if (place.zipCode) onChange("zipCode", place.zipCode);
                onChange("latitude", place.latitude);
                onChange("longitude", place.longitude);
              }}
              disabled={isReadOnly}
              placeholder="Start typing to search for the hotel address..."
            />
          </div>

          <Input
            label="City"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            error={errors.city}
            required
            disabled={isReadOnly}
            placeholder="New York"
          />

          <Select
            label="Country"
            value={formData.country}
            onChange={(e) => onChange("country", e.target.value)}
            options={COUNTRY_OPTIONS}
            error={errors.country}
            required
            disabled={isReadOnly}
          />

          <Input
            label="Zip Code"
            value={formData.zipCode}
            onChange={(e) => onChange("zipCode", e.target.value)}
            disabled={isReadOnly}
            placeholder="10001"
          />

          {/* Location Preview */}
          {!isReadOnly && formData.latitude && formData.longitude && (
            <div className="md:col-span-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">
                <span className="font-medium">📍 Location set:</span>{" "}
                {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </ModalFormGrid>
      </ModalFormSection>

      {/* Hotel Details */}
      <ModalFormSection title="Hotel Details">
        <ModalFormGrid columns={2}>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Official Languages
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LANGUAGE_OPTIONS.filter((opt) => opt.value !== "").map(
                (language) => (
                  <label
                    key={language.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.officialLanguages.includes(
                        language.value
                      )}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const currentLanguages = formData.officialLanguages;
                        if (e.target.checked) {
                          onChange("officialLanguages", [
                            ...currentLanguages,
                            language.value,
                          ]);
                        } else {
                          onChange(
                            "officialLanguages",
                            currentLanguages.filter(
                              (lang) => lang !== language.value
                            )
                          );
                        }
                      }}
                      disabled={isReadOnly}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {language.label}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <Input
            label="Number of Rooms"
            type="number"
            value={formData.numberRooms?.toString() || ""}
            onChange={(e) =>
              onChange(
                "numberRooms",
                e.target.value ? Number(e.target.value) : null
              )
            }
            disabled={isReadOnly}
            placeholder="100"
          />

          <Select
            label="Currency"
            value={formData.currency}
            onChange={(e) => onChange("currency", e.target.value)}
            options={currencyOptions}
            disabled={isReadOnly}
          />

          <Select
            label="Membership"
            value={formData.membership}
            onChange={(e) => onChange("membership", e.target.value)}
            options={membershipOptions}
            disabled={isReadOnly}
          />

          <div className="md:col-span-2">
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange("description", e.target.value)
              }
              disabled={isReadOnly}
              rows={3}
              placeholder="Enter hotel description..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange("isActive", e.target.checked)
                }
                disabled={isReadOnly}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </ModalFormGrid>
      </ModalFormSection>
    </div>
  );
}
