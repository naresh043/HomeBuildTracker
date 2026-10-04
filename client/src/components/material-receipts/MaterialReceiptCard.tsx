import { Check, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";

import type { MaterialReceipt } from "@/features/material-receipts/material-receipt.types";
import { formatReceiptCurrency, formatReceiptDate, formatReceiptUnit, VERIFICATION_STATUS_LABELS } from "@/features/material-receipts/material-receipt.utils";

interface MaterialReceiptCardProps {
  receipt: MaterialReceipt;
  vendorName: string;
  materialName: string;
  stageName: string;
  isVerifying?: boolean;
  isRestoring?: boolean;
  onDetails: (receipt: MaterialReceipt) => void;
  onEdit: (receipt: MaterialReceipt) => void;
  onVerify: (receipt: MaterialReceipt) => void;
  onDelete: (receipt: MaterialReceipt) => void;
  onRestore: (receipt: MaterialReceipt) => void;
}

export default function MaterialReceiptCard({ receipt, vendorName, materialName, stageName, isVerifying = false, isRestoring = false, onDetails, onEdit, onVerify, onDelete, onRestore }: MaterialReceiptCardProps) {
  const verified = receipt.verificationStatus === "VERIFIED";
  return (
    <article className={`min-w-0 rounded-2xl border border-border p-4 shadow-sm ${receipt.isDeleted ? "border-destructive/30 bg-muted/40" : "bg-card"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{receipt.receiptNo} · {formatReceiptDate(receipt.date)}</p><h2 className="mt-1 truncate text-base font-semibold text-foreground">{materialName}</h2><p className="mt-0.5 truncate text-sm text-muted-foreground">{vendorName}</p></div>
        <div className="flex shrink-0 flex-col items-end gap-1"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${verified ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"}`}>{VERIFICATION_STATUS_LABELS[receipt.verificationStatus]}</span>{receipt.isDeleted && <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">Deleted</span>}</div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-3">
        <div><p className="text-xs text-muted-foreground">{receipt.quantity} {formatReceiptUnit(receipt.unit)} · {formatReceiptCurrency(receipt.unitPrice)} / unit</p><p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{formatReceiptCurrency(receipt.totalAmount)}</p><p className="mt-0.5 text-xs text-muted-foreground">{stageName}</p></div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" aria-label={`View ${receipt.receiptNo}`} title="View details" onClick={() => onDetails(receipt)} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="h-4 w-4" /></button>
          {receipt.isDeleted ? (
            <button type="button" aria-label={`Restore ${receipt.receiptNo}`} title="Restore receipt" disabled={isRestoring} onClick={() => onRestore(receipt)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"><RotateCcw className="h-4 w-4" />{isRestoring ? "Restoring…" : "Restore"}</button>
          ) : <>
            <button type="button" aria-label={`Edit ${receipt.receiptNo}`} title="Edit" onClick={() => onEdit(receipt)} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
            {!verified && <button type="button" aria-label={`Verify ${receipt.receiptNo}`} title="Verify receipt" disabled={isVerifying} onClick={() => onVerify(receipt)} className="flex h-10 w-10 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-500/10 disabled:opacity-50"><Check className="h-4 w-4" /></button>}
            <button type="button" aria-label={`Delete ${receipt.receiptNo}`} title="Delete" onClick={() => onDelete(receipt)} className="flex h-10 w-10 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
          </>}
        </div>
      </div>
    </article>
  );
}
