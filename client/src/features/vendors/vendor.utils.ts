import {
  VENDOR_STATUS,
  VENDOR_TYPE,
  type Vendor,
  type VendorStatus,
  type VendorType,
} from "./vendor.types";

export const getVendorTypeLabel = (
  type: VendorType,
): string => {
  switch (type) {
    case VENDOR_TYPE.CONTRACTOR:
      return "Contractor";

    case VENDOR_TYPE.MATERIAL_SUPPLIER:
      return "Material Supplier";

    case VENDOR_TYPE.SERVICE_PROVIDER:
      return "Service Provider";

    case VENDOR_TYPE.OTHER:
      return "Other";

    default:
      return type;
  }
};

export const getVendorStatusLabel = (
  status: VendorStatus,
): string => {
  switch (status) {
    case VENDOR_STATUS.ACTIVE:
      return "Active";

    case VENDOR_STATUS.INACTIVE:
      return "Inactive";

    default:
      return status;
  }
};

export const getVendorTypeOptions = (): Array<{
  value: VendorType;
  label: string;
}> => {
  return [
    {
      value: VENDOR_TYPE.CONTRACTOR,
      label: "Contractor",
    },
    {
      value: VENDOR_TYPE.MATERIAL_SUPPLIER,
      label: "Material Supplier",
    },
    {
      value: VENDOR_TYPE.SERVICE_PROVIDER,
      label: "Service Provider",
    },
    {
      value: VENDOR_TYPE.OTHER,
      label: "Other",
    },
  ];
};

export const getVendorStatusOptions = (): Array<{
  value: VendorStatus;
  label: string;
}> => {
  return [
    {
      value: VENDOR_STATUS.ACTIVE,
      label: "Active",
    },
    {
      value: VENDOR_STATUS.INACTIVE,
      label: "Inactive",
    },
  ];
};

export const getVendorInitials = (
  name: string,
): string => {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return "V";
  }

  const words = normalizedName
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const getVendorDisplayPhone = (
  vendor: Vendor,
): string => {
  return vendor.phone?.trim() || "No phone number";
};

export const getVendorDisplayEmail = (
  vendor: Vendor,
): string => {
  return vendor.email?.trim() || "No email address";
};

export const getVendorDisplayAddress = (
  vendor: Vendor,
): string => {
  return vendor.address?.trim() || "No address provided";
};

export const getVendorDisplayNotes = (
  vendor: Vendor,
): string => {
  return vendor.notes?.trim() || "No notes";
};

export const isVendorActive = (
  vendor: Vendor,
): boolean => {
  return (
    vendor.status === VENDOR_STATUS.ACTIVE &&
    !vendor.isDeleted
  );
};

export const isVendorDeleted = (
  vendor: Vendor,
): boolean => {
  return vendor.isDeleted;
};

export const getVendorStatusDescription = (
  vendor: Vendor,
): string => {
  if (vendor.isDeleted) {
    return "Deleted";
  }

  return getVendorStatusLabel(vendor.status);
};