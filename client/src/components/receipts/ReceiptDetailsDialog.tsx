import {
  Download,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Unlink,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { Receipt } from "@/features/receipts/receipt.types";
import { getReceiptPreview } from "@/api/receipts.api";
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

const deferObjectUrlRevoke = (url: string) => {
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const getPdfDownloadName = (originalFileName: string) => {
  const safeName = originalFileName
    .replace(/[\\/]/g, "_")
    .trim();
  const filename = safeName || "receipt.pdf";
  return /\.pdf$/i.test(filename) ? filename : `${filename}.pdf`;
};

export default function ReceiptDetailsDialog({
  receipt,
  onClose,
}: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(
    () => window.matchMedia("(max-width: 639px)").matches,
  );
  const openedPdfUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateMobileLayout = () => setIsMobileLayout(mediaQuery.matches);
    updateMobileLayout();
    mediaQuery.addEventListener("change", updateMobileLayout);
    return () => mediaQuery.removeEventListener("change", updateMobileLayout);
  }, []);

  useEffect(() => {
    let objectUrl: string | null = null;
    const controller = new AbortController();

    const loadPdf = async () => {
      if (!receipt || receipt.fileType !== "PDF" || isMobileLayout) {
        setPdfUrl(null);
        setIsPdfLoading(false);
        setPdfError(null);
        return;
      }

      setIsPdfLoading(true);
      setPdfError(null);
      setPdfUrl(null);

      try {
        const blob = await getReceiptPreview(receipt._id, controller.signal);

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
        openedPdfUrlRef.current = objectUrl;

        setPdfUrl(objectUrl);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

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

      const urlToCleanup = objectUrl ?? openedPdfUrlRef.current;
      if (urlToCleanup) {
        if (openedPdfUrlRef.current === urlToCleanup) {
          deferObjectUrlRevoke(urlToCleanup);
        } else {
          URL.revokeObjectURL(urlToCleanup);
        }
        openedPdfUrlRef.current = null;
      }
    };
  }, [receipt, isMobileLayout]);

  if (!receipt) {
    return null;
  }

  const isImage = receipt.fileType === "IMAGE";
  const isPdf = receipt.fileType === "PDF";
  const linkedTransaction = receipt.linkedTransaction;

  const handleDownloadPdf = async () => {
    if (!isPdf || isPdfDownloading) return;

    setIsPdfDownloading(true);
    try {
      const blob = await getReceiptPreview(receipt._id);
      if (blob.size === 0) throw new Error("Empty PDF response");

      const pdfBlob = blob.type === "application/pdf"
        ? blob
        : new Blob([blob], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = getPdfDownloadName(receipt.originalFileName);
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      deferObjectUrlRevoke(downloadUrl);
      toast.success("PDF downloaded successfully. Open it from your Downloads.");
    } catch {
      toast.error("Unable to download the PDF. Please try again.");
    } finally {
      setIsPdfDownloading(false);
    }
  };

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
      const newWindow = window.open(pdfUrl, "_blank", "noopener,noreferrer");
      if (newWindow) openedPdfUrlRef.current = pdfUrl;
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

          {isPdf && !isMobileLayout && isPdfLoading && (
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

          {isPdf && !isMobileLayout && !isPdfLoading && pdfUrl && (
            <iframe
              title={`Preview of ${receipt.originalFileName}`}
              src={pdfUrl}
              className="h-[55vh] w-full border-0"
            />
          )}

          {isPdf && isMobileLayout && (
            <div
              className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <FileText
                  className="h-7 w-7 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-4 font-semibold">
                PDF preview isn’t available inside the app on mobile.
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Open the downloaded file from your Downloads.
              </p>
            </div>
          )}

          {isPdf && !isMobileLayout && !isPdfLoading && pdfError && (
            <div className="flex h-[55vh] flex-col items-center justify-center px-6 text-center" role="alert">
              <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm text-muted-foreground">Unable to preview this PDF.</p>
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

        {isPdf && isMobileLayout ? (
          <button
            type="button"
            disabled={isPdfDownloading}
            onClick={() => void handleDownloadPdf()}
            aria-label={isPdfDownloading ? "Downloading PDF" : "Download PDF"}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPdfDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {isPdfDownloading ? "Downloading…" : "Download PDF"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenFile}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            {isPdf ? "Open PDF in new tab" : "Open receipt file"}
          </button>
        )}
      </section>
    </div>
  );
}
