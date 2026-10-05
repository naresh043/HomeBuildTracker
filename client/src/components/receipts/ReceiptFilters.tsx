import { Filter, Search, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { RECEIPT_SOURCE_TYPES } from "@/features/receipts/receipt.types";
import { RECEIPT_SOURCE_LABELS } from "@/features/receipts/receipt.utils";

interface Props {
  search: string;
  sourceType: string;
  fileType: string;
  fromDate: string;
  toDate: string;
  deletedOnly: boolean;
  onChange: (
    key:
      | "search"
      | "sourceType"
      | "fileType"
      | "fromDate"
      | "toDate"
      | "deletedOnly",
    value: string | boolean,
  ) => void;
  onClear: () => void;
}

const control =
  "min-h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";

const parseDate = (value: string) => {
  if (!value) return undefined;

  const [y, m, d] = value.split("-").map(Number);

  if (!y || !m || !d) return undefined;

  const date = new Date(y, m - 1, d);

  return date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
    ? date
    : undefined;
};

export default function ReceiptFilters(p: Props) {
  const active = Boolean(
    p.search.trim() ||
      p.sourceType ||
      p.fileType ||
      p.fromDate ||
      p.toDate ||
      p.deletedOnly,
  );

  return (
    <section
      aria-label="Receipt filters"
      className="rounded-2xl border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" aria-hidden="true" />

          <div>
            <h2 className="text-sm font-semibold">Filter receipts</h2>

            <p className="text-xs text-muted-foreground">
              Search and narrow by source, file type, or upload date.
            </p>
          </div>
        </div>

        {active && (
          <button
            type="button"
            onClick={p.onClear}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm hover:bg-muted"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* Search */}
        <div className="sm:col-span-2 xl:col-span-4">
          <label
            htmlFor="receipt-search"
            className="mb-1.5 block text-xs font-medium"
          >
            Search receipt number
          </label>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <input
              id="receipt-search"
              type="search"
              value={p.search}
              onChange={(e) => p.onChange("search", e.target.value)}
              placeholder="e.g. RCP-0001"
              className={`${control} pl-10`}
            />
          </div>
        </div>

        {/* Source Type */}
        <label className="space-y-1.5 text-xs font-medium">
          Source Type

          <select
            className={control}
            value={p.sourceType}
            onChange={(e) =>
              p.onChange("sourceType", e.target.value)
            }
          >
            <option value="">All sources</option>

            {RECEIPT_SOURCE_TYPES.map((x) => (
              <option key={x} value={x}>
                {RECEIPT_SOURCE_LABELS[x]}
              </option>
            ))}
          </select>
        </label>

        {/* File Type */}
        <label className="space-y-1.5 text-xs font-medium">
          File Type

          <select
            className={control}
            value={p.fileType}
            onChange={(e) =>
              p.onChange("fileType", e.target.value)
            }
          >
            <option value="">All file types</option>
            <option value="IMAGE">Image</option>
            <option value="PDF">PDF</option>
          </select>
        </label>

        {/* From Date */}
        <div className="space-y-1.5 text-xs font-medium">
          <span id="receipt-from-label">From date</span>

          <DatePicker
            ariaLabelledBy="receipt-from-label"
            value={p.fromDate}
            maxDate={parseDate(p.toDate)}
            onChange={(value) => p.onChange("fromDate", value)}
            placeholder="Any date"
          />
        </div>

        {/* To Date */}
        <div className="space-y-1.5 text-xs font-medium">
          <span id="receipt-to-label">To date</span>

          <DatePicker
            ariaLabelledBy="receipt-to-label"
            value={p.toDate}
            minDate={parseDate(p.fromDate)}
            onChange={(value) => p.onChange("toDate", value)}
            placeholder="Any date"
          />
        </div>

        {/* Deleted */}
        <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 sm:col-span-2 xl:col-span-4">
          <span>
            <span className="block text-sm font-medium">
              Show deleted receipts only
            </span>

            <span className="text-xs text-muted-foreground">
              Browse deleted files and restore them.
            </span>
          </span>

          <input
            aria-label="Show deleted receipts only"
            type="checkbox"
            checked={p.deletedOnly}
            onChange={(e) =>
              p.onChange("deletedOnly", e.target.checked)
            }
            className="h-5 w-5 accent-primary"
          />
        </label>
      </div>
    </section>
  );
}