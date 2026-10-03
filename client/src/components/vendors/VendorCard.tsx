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
  const isDeleted = vendor.isDeleted;
  const active = isVendorActive(vendor);
  const statusLabel = getVendorStatusDescription(vendor);

  return (
    <article
      className={[
        "flex h-full w-full flex-col rounded-2xl border border-border bg-card p-4 shadow-sm",
        isDeleted ? "opacity-75" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Vendor Header */}
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            isDeleted
              ? "bg-muted text-muted-foreground"
              : "bg-muted text-foreground",
          ].join(" ")}
        >
          <UserRound
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={[
              "truncate text-base font-semibold",
              isDeleted
                ? "text-muted-foreground"
                : "text-foreground",
            ].join(" ")}
          >
            {vendor.name}
          </h3>

          <p
            className={[
              "mt-0.5 truncate text-sm",
              isDeleted
                ? "text-muted-foreground/80"
                : "text-muted-foreground",
            ].join(" ")}
          >
            {getVendorTypeLabel(vendor.type)}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
            isDeleted
              ? "bg-destructive/10 text-destructive"
              : active
                ? "bg-green-50 text-green-700"
                : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {isDeleted ? "Deleted" : statusLabel}
        </span>
      </div>

      {/* Contact Information */}
      <div
        className={[
          "mt-4 space-y-3",
          isDeleted ? "text-muted-foreground/80" : "",
        ].join(" ")}
      >
        {vendor.phone && (
          <a
            href={`tel:${vendor.phone}`}
            className={[
              "flex min-h-10 min-w-0 items-center gap-3 text-sm",
              isDeleted
                ? "text-muted-foreground"
                : "text-foreground",
            ].join(" ")}
          >
            <Phone
              className={[
                "h-4 w-4 shrink-0",
                isDeleted
                  ? "text-muted-foreground/70"
                  : "text-muted-foreground",
              ].join(" ")}
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
            className={[
              "flex min-h-10 min-w-0 items-center gap-3 text-sm",
              isDeleted
                ? "text-muted-foreground"
                : "text-foreground",
            ].join(" ")}
          >
            <Mail
              className={[
                "h-4 w-4 shrink-0",
                isDeleted
                  ? "text-muted-foreground/70"
                  : "text-muted-foreground",
              ].join(" ")}
              aria-hidden="true"
            />

            <span className="truncate">
              {vendor.email}
            </span>
          </a>
        )}

        {vendor.address && (
          <div
            className={[
              "flex min-w-0 items-start gap-3 text-sm",
              isDeleted
                ? "text-muted-foreground"
                : "text-foreground",
            ].join(" ")}
          >
            <MapPin
              className={[
                "mt-0.5 h-4 w-4 shrink-0",
                isDeleted
                  ? "text-muted-foreground/70"
                  : "text-muted-foreground",
              ].join(" ")}
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
        <div
          className={[
            "mt-4 rounded-xl p-3",
            isDeleted ? "bg-muted/50" : "bg-muted/50",
          ].join(" ")}
        >
          <p
            className={[
              "line-clamp-3 text-sm leading-5",
              isDeleted
                ? "text-muted-foreground"
                : "text-muted-foreground",
            ].join(" ")}
          >
            {vendor.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-4">
        <div className="flex gap-2 border-t border-border pt-4">
          {!isDeleted ? (
            <>
              <button
                type="button"
                onClick={() => onEdit(vendor)}
                className="min-h-10 flex-1 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring active:bg-muted"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(vendor)}
                className="min-h-10 flex-1 rounded-xl border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive/30 active:bg-destructive/10"
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