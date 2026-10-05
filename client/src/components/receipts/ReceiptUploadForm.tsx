import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { RECEIPT_SOURCE_TYPES } from "@/features/receipts/receipt.types";
import { RECEIPT_SOURCE_LABELS } from "@/features/receipts/receipt.utils";
import {
  receiptUploadSchema,
  type ReceiptUploadValues,
} from "@/features/receipts/receipt.schema";

interface Props {
  open: boolean;
  isUploading: boolean;
  onSubmit: (values: ReceiptUploadValues) => Promise<void>;
  onCancel: () => void;
}

export default function ReceiptUploadForm({
  open,
  isUploading,
  onSubmit,
  onCancel,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReceiptUploadValues>({
    resolver: zodResolver(receiptUploadSchema),
  });

  const sourceTypeField = register("sourceType");

  useEffect(() => {
    if (!open) {
      return;
    }

    reset();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, reset]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setValue("file", file, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleCancel = () => {
    reset();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      {/* Receipt File */}
      <div>
        <label
          htmlFor="receipt-file"
          className="mb-1.5 block text-sm font-medium"
        >
          Receipt file
        </label>

        <input
          id="receipt-file"
          name="file"
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,application/pdf"
          aria-describedby="receipt-file-help receipt-file-error"
          aria-invalid={Boolean(errors.file)}
          onChange={handleFileChange}
          className="block min-h-11 w-full rounded-xl border bg-background p-2 text-sm file:mr-3 file:min-h-8 file:rounded-lg file:border-0 file:bg-muted file:px-3"
        />

        <p
          id="receipt-file-help"
          className="mt-1 text-xs text-muted-foreground"
        >
          Supported formats: JPG, PNG, WebP, PDF · Maximum 10 MB
        </p>

        {errors.file && (
          <p
            id="receipt-file-error"
            role="alert"
            className="mt-1 text-sm text-destructive"
          >
            {errors.file.message}
          </p>
        )}
      </div>

      {/* Source Type */}
      <div>
        <label
          htmlFor="receipt-source"
          className="mb-1.5 block text-sm font-medium"
        >
          Source type
        </label>

        <select
          id="receipt-source"
          aria-invalid={Boolean(errors.sourceType)}
          {...sourceTypeField}
          defaultValue=""
          className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm"
        >
          <option value="" disabled>
            Select a source
          </option>

          {RECEIPT_SOURCE_TYPES.map((sourceType) => (
            <option value={sourceType} key={sourceType}>
              {RECEIPT_SOURCE_LABELS[sourceType]}
            </option>
          ))}
        </select>

        {errors.sourceType && (
          <p
            role="alert"
            className="mt-1 text-sm text-destructive"
          >
            {errors.sourceType.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isUploading}
          onClick={handleCancel}
          className="min-h-11 rounded-xl border px-4 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isUploading}
          className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? "Uploading…" : "Upload receipt"}
        </button>
      </div>
    </form>
  );
}