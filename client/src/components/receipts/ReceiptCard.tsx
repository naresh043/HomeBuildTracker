import {
  Eye,
  FileText,
  Image as ImageIcon,
  Link2,
  RotateCcw,
  Trash2,
  Unlink,
} from "lucide-react";

import type { Receipt } from "@/features/receipts/receipt.types";
import {
  formatReceiptCreatedDate,
  formatReceiptSize,
  RECEIPT_SOURCE_LABELS,
} from "@/features/receipts/receipt.utils";

interface Props {
  receipt: Receipt;
  isRestoring: boolean;
  onDetails: (receipt: Receipt) => void;
  onLink: (receipt: Receipt) => void;
  onUnlink: (receipt: Receipt) => void;
  onDelete: (receipt: Receipt) => void;
  onRestore: (receipt: Receipt) => void;
}

const getLinkedTransactionLabel = (
  type: "payment" | "materialReceipt" | "expense",
) => {
  switch (type) {
    case "payment":
      return "Payment";

    case "materialReceipt":
      return "Material Receipt";

    case "expense":
      return "Expense";
  }
};

export default function ReceiptCard({
  receipt,
  isRestoring,
  onDetails,
  onLink,
  onUnlink,
  onDelete,
  onRestore,
}: Props) {
  const isDeleted = receipt.isDeleted;
  const isImage = receipt.fileType === "IMAGE";
  const isPdf = receipt.fileType === "PDF";
  const linkedTransaction = receipt.linkedTransaction;

  return (
    <article
      className={[
        "min-w-0 overflow-hidden rounded-2xl border p-4 shadow-sm",
        isDeleted
          ? "border-destructive/30 bg-muted/40"
          : "border-border bg-card",
      ].join(" ")}
    >
      {/* Main content */}
      <div className="flex min-w-0 gap-4">
        {/* Preview */}
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted"
          aria-hidden="true"
        >
          {isImage ? (
            <img
              src={receipt.fileUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : isPdf ? (
            <FileText className="h-8 w-8 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        {/* Receipt information */}
        <div className="min-w-0 flex-1">
          <h2 className="break-words font-semibold leading-snug">
            {receipt.originalFileName}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {formatReceiptCreatedDate(receipt.createdAt)}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium">
              {RECEIPT_SOURCE_LABELS[receipt.sourceType]}
            </span>

            <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
              {receipt.fileType}
            </span>

            <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
              {formatReceiptSize(receipt.sizeBytes)}
            </span>

            {linkedTransaction && (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <Link2
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />

                <span className="truncate">
                  {getLinkedTransactionLabel(linkedTransaction.type)}:{" "}
                  {linkedTransaction.label}
                </span>
              </span>
            )}

            {isDeleted && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                Deleted
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap justify-end gap-1 border-t pt-3">
        {/* Details / Preview */}
        <button
          type="button"
          aria-label={`View ${receipt.originalFileName}`}
          onClick={() => onDetails(receipt)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View
        </button>

        {/* Active receipt actions */}
        {!isDeleted && (
          <>
            {!linkedTransaction ? (
              <button
                type="button"
                aria-label={`Link ${receipt.originalFileName}`}
                onClick={() => onLink(receipt)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Link2 className="h-4 w-4" aria-hidden="true" />
                Link
              </button>
            ) : (
              <button
                type="button"
                aria-label={`Unlink ${receipt.originalFileName}`}
                onClick={() => onUnlink(receipt)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Unlink className="h-4 w-4" aria-hidden="true" />
                Unlink
              </button>
            )}

            <button
              type="button"
              aria-label={`Delete ${receipt.originalFileName}`}
              onClick={() => onDelete(receipt)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </>
        )}

        {/* Deleted receipt action */}
        {isDeleted && (
          <button
            type="button"
            aria-label={`Restore ${receipt.originalFileName}`}
            disabled={isRestoring}
            onClick={() => onRestore(receipt)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {isRestoring ? "Restoring…" : "Restore"}
          </button>
        )}
      </div>
    </article>
  );
}