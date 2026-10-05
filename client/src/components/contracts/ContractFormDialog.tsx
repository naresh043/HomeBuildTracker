import { X } from "lucide-react";
import ContractForm from "./ContractForm";
import type { Contract } from "@/features/contracts/contract.types";
import type { ContractFormValues } from "@/features/contracts/contract.schema";
import type { Vendor } from "@/features/vendors/vendor.types";
interface Props { open: boolean; contract: Contract | null; vendors: Vendor[]; submitting: boolean; onClose: () => void; onSubmit: (values: ContractFormValues) => void }
export default function ContractFormDialog({ open, contract, vendors, submitting, onClose, onSubmit }: Props) {
 if (!open) return null;
 return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="contract-form-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-xl sm:max-w-2xl sm:rounded-2xl"><header className="mb-5 flex items-start justify-between"><div><h2 id="contract-form-title" className="text-lg font-semibold">{contract ? "Edit contract" : "Add contract"}</h2><p className="mt-1 text-sm text-muted-foreground">Set the terms and scope for this contractor.</p></div><button type="button" aria-label="Close dialog" disabled={submitting} onClick={onClose} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button></header><ContractForm key={contract?.id ?? "new"} contract={contract} vendors={vendors} submitting={submitting} onSubmit={onSubmit} onCancel={onClose} /></section></div>;
}
