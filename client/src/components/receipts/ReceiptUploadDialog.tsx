import { useState } from "react";
import { X } from "lucide-react";
import ReceiptUploadForm from "./ReceiptUploadForm";
import type { ReceiptUploadValues } from "@/features/receipts/receipt.schema";
export default function ReceiptUploadDialog({
  open,
  isUploading,
  onUpload,
  onClose,
  error,
}: {
  open: boolean;
  isUploading: boolean;
  onUpload: (v: ReceiptUploadValues) => Promise<void>;
  onClose: () => void;
  error: string;
}) {
  const [key, setKey] = useState(0);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isUploading) {
          setKey((k) => k + 1);
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-upload-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="receipt-upload-title" className="text-lg font-semibold">
              Upload Receipt
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a supporting document. You can link it to a transaction
              afterward.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close upload dialog"
            disabled={isUploading}
            onClick={() => {
              setKey((k) => k + 1);
              onClose();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <ReceiptUploadForm
          key={key}
          open={open}
          isUploading={isUploading}
          onSubmit={onUpload}
          onCancel={() => {
            setKey((k) => k + 1);
            onClose();
          }}
        />
      </section>
    </div>
  );
}
