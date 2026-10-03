import { Mail, MapPin, Phone, UserRound } from "lucide-react";

import type { Vendor } from "@/features/vendors/vendor.types";
import {
  getVendorStatusDescription,
  getVendorTypeLabel,
  isVendorActive,
} from "@/features/vendors/vendor.utils";

interface VendorCardProps {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
  onRestore: (vendor: Vendor) => void;
}

const VendorCard = ({
  vendor,
  onEdit,
  onDelete,
  onRestore,
}: VendorCardProps) => {
  const active = isVendorActive(vendor);
  const statusLabel = getVendorStatusDescription(vendor);

  return (
    <article className="flex h-full w-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Vendor Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
          <UserRound
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {vendor.name}
          </h3>

          <p className="mt-0.5 truncate text-sm text-gray-500">
            {getVendorTypeLabel(vendor.type)}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
            active
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-600",
          ].join(" ")}
        >
          {statusLabel}
        </span>

        {vendor.isDeleted && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
            Deleted
          </span>
        )}
      </div>

      {/* Contact Information */}
      <div className="mt-4 space-y-3">
        {vendor.phone && (
          <a
            href={`tel:${vendor.phone}`}
            className="flex min-h-10 min-w-0 items-center gap-3 text-sm text-gray-700"
          >
            <Phone
              className="h-4 w-4 shrink-0 text-gray-400"
              aria-hidden="true"
            />

            <span className="truncate">
              {vendor.phone}
            </span>
          </a>
        )}

        {vendor.email && (
          <a
            href={`mailto:${vendor.email}`}
            className="flex min-h-10 min-w-0 items-center gap-3 text-sm text-gray-700"
          >
            <Mail
              className="h-4 w-4 shrink-0 text-gray-400"
              aria-hidden="true"
            />

            <span className="truncate">
              {vendor.email}
            </span>
          </a>
        )}

        {vendor.address && (
          <div className="flex min-w-0 items-start gap-3 text-sm text-gray-700">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
              aria-hidden="true"
            />

            <span className="line-clamp-2">
              {vendor.address}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {vendor.notes && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <p className="line-clamp-3 text-sm leading-5 text-gray-600">
            {vendor.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-4">
        <div className="flex gap-2 border-t border-gray-100 pt-4">
          {!vendor.isDeleted ? (
            <>
              <button
                type="button"
                onClick={() => onEdit(vendor)}
                className="min-h-10 flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 active:bg-gray-100"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(vendor)}
                className="min-h-10 flex-1 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 active:bg-red-100"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onRestore(vendor)}
              className="min-h-10 w-full rounded-xl border border-green-200 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 active:bg-green-100"
            >
              Restore
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default VendorCard;