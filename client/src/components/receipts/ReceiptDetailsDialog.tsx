import {
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Unlink,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Receipt } from "@/features/receipts/receipt.types";
import {
  formatReceiptCreatedDate,
  formatReceiptSize,
  RECEIPT_SOURCE_LABELS,
} from "@/features/receipts/receipt.utils";

interface Props {
  receipt: Receipt | null;
  onClose: () => void;
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

export default function ReceiptDetailsDialog({
  receipt,
  onClose,
}: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    const controller = new AbortController();

    const loadPdf = async () => {
      if (!receipt || receipt.fileType !== "PDF") {
        setPdfUrl(null);
        setIsPdfLoading(false);
        setPdfError(null);
        return;
      }

      setIsPdfLoading(true);
      setPdfError(null);
      setPdfUrl(null);

      try {
        const response = await fetch(receipt.fileUrl, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load PDF (${response.status})`);
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("The PDF file is empty.");
        }

        const pdfBlob =
          blob.type === "application/pdf"
            ? blob
            : new Blob([blob], {
                type: "application/pdf",
              });

        objectUrl = URL.createObjectURL(pdfBlob);

        setPdfUrl(objectUrl);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load receipt PDF:", error);

        setPdfError(
          "The PDF preview could not be loaded. Please try again.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsPdfLoading(false);
        }
      }
    };

    void loadPdf();

    return () => {
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [receipt]);

  if (!receipt) {
    return null;
  }

  const isImage = receipt.fileType === "IMAGE";
  const isPdf = receipt.fileType === "PDF";
  const linkedTransaction = receipt.linkedTransaction;

  const handleOpenFile = () => {
    if (isImage) {
      window.open(
        receipt.fileUrl,
        "_blank",
        "noopener,noreferrer",
      );

      return;
    }

    if (isPdf && pdfUrl) {
      window.open(
        pdfUrl,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-details-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-xl sm:max-w-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="receipt-details-title"
              className="text-lg font-semibold"
            >
              Receipt details
            </h2>

            <p className="mt-1 break-words text-sm text-muted-foreground">
              {receipt.originalFileName}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close receipt details"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Preview */}
        <div className="mt-4 overflow-hidden rounded-xl border bg-muted/20">
          {isImage && (
            <div className="flex min-h-[300px] items-center justify-center p-3 sm:min-h-[55vh]">
              <img
                src={receipt.fileUrl}
                alt={receipt.originalFileName}
                className="max-h-[55vh] w-full object-contain"
              />
            </div>
          )}

          {isPdf && isPdfLoading && (
            <div
              className="flex h-[55vh] flex-col items-center justify-center gap-3"
              role="status"
              aria-live="polite"
            >
              <Loader2
                className="h-8 w-8 animate-spin text-muted-foreground"
                aria-hidden="true"
              />

              <p className="text-sm text-muted-foreground">
                Loading PDF preview…
              </p>
            </div>
          )}

          {isPdf && !isPdfLoading && pdfUrl && (
            <iframe
              title={`Preview of ${receipt.originalFileName}`}
              src={pdfUrl}
              className="h-[55vh] w-full border-0"
            />
          )}

          {isPdf && !isPdfLoading && pdfError && (
            <div
              className="flex h-[55vh] flex-col items-center justify-center px-6 text-center"
              role="alert"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <FileText
                  className="h-7 w-7 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-4 font-semibold">
                PDF preview unavailable
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {pdfError}
              </p>

              <p className="mt-3 text-xs text-muted-foreground">
                Check your connection and try opening the receipt again.
              </p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">
              Source
            </dt>

            <dd className="mt-1">
              {RECEIPT_SOURCE_LABELS[receipt.sourceType]}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">
              File type
            </dt>

            <dd className="mt-1">
              {receipt.fileType} · {receipt.mimeType}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">
              Size
            </dt>

            <dd className="mt-1">
              {formatReceiptSize(receipt.sizeBytes)}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">
              Uploaded
            </dt>

            <dd className="mt-1">
              {formatReceiptCreatedDate(receipt.createdAt)}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">
              Status
            </dt>

            <dd className="mt-1">
              {receipt.isDeleted ? "Deleted" : "Active"}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">
              Linked transaction
            </dt>

            <dd className="mt-1">
              {linkedTransaction ? (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                  <Link2
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />

                  <span className="truncate">
                    {getLinkedTransactionLabel(
                      linkedTransaction.type,
                    )}
                    : {linkedTransaction.label}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Unlink
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Not linked
                </span>
              )}
            </dd>
          </div>
        </dl>

        {/* Open file */}
        <button
          type="button"
          disabled={isPdf && (!pdfUrl || isPdfLoading)}
          onClick={handleOpenFile}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ExternalLink
            className="h-4 w-4"
            aria-hidden="true"
          />

          {isPdf
            ? isPdfLoading
              ? "Preparing PDF…"
              : "Open PDF in new tab"
            : "Open receipt file"}
        </button>
      </section>
    </div>
  );
}