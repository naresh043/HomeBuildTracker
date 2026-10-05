import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import MaterialReceiptDeleteDialog from "@/components/material-receipts/MaterialReceiptDeleteDialog";
import MaterialReceiptEmptyState from "@/components/material-receipts/MaterialReceiptEmptyState";
import MaterialReceiptErrorState from "@/components/material-receipts/MaterialReceiptErrorState";
import MaterialReceiptFilters from "@/components/material-receipts/MaterialReceiptFilters";
import MaterialReceiptFormDialog from "@/components/material-receipts/MaterialReceiptFormDialog";
import MaterialReceiptHeader from "@/components/material-receipts/MaterialReceiptHeader";
import MaterialReceiptList from "@/components/material-receipts/MaterialReceiptList";
import MaterialReceiptLoadingState from "@/components/material-receipts/MaterialReceiptLoadingState";
import {
  useActiveVendorsQuery,
  useVendorsQuery,
} from "@/features/vendors/vendor.queries";
import { useMaterialsQuery } from "@/features/materials/material.queries";
import { useStagesQuery } from "@/features/stages/stage.queries";
import {
  useCreateMaterialReceiptMutation,
  useDeleteMaterialReceiptMutation,
  useRestoreMaterialReceiptMutation,
  useUpdateMaterialReceiptMutation,
  useVerifyMaterialReceiptMutation,
} from "@/features/material-receipts/material-receipt.mutations";
import {
  useMaterialReceiptQuery,
  useMaterialReceiptsQuery,
} from "@/features/material-receipts/material-receipt.queries";
import type { MaterialReceiptFormValues } from "@/features/material-receipts/material-receipt.schema";
import type {
  MaterialReceipt,
  MaterialReceiptListParams,
  MaterialReceiptVerificationStatus,
  UpdateMaterialReceiptRequest,
} from "@/features/material-receipts/material-receipt.types";
import {
  formatReceiptCurrency,
  formatReceiptDate,
  formatReceiptUnit,
  VERIFICATION_STATUS_LABELS,
} from "@/features/material-receipts/material-receipt.utils";

const PAGE_SIZE = 20;

const getMutationErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export default function MaterialReceiptsPage() {
  const [search, setSearch] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [stageId, setStageId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    MaterialReceiptVerificationStatus | ""
  >("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<MaterialReceipt | null>(
    null,
  );
  const [deletingReceipt, setDeletingReceipt] =
    useState<MaterialReceipt | null>(null);
  const [detailReceipt, setDetailReceipt] = useState<MaterialReceipt | null>(
    null,
  );

  const params: MaterialReceiptListParams = {
    page,
    limit: PAGE_SIZE,
    q: search.trim() || undefined,
    vendorId: vendorId || undefined,
    materialId: materialId || undefined,
    stageId: stageId || undefined,
    verificationStatus: verificationStatus || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    includeDeleted: includeDeleted || undefined,
  };

  const receiptsQuery = useMaterialReceiptsQuery(params);
  const detailQuery = useMaterialReceiptQuery(
    detailReceipt?.id ?? "",
    Boolean(detailReceipt),
    detailReceipt?.isDeleted ?? false,
  );
  const vendorsQuery = useActiveVendorsQuery();
  const vendorDirectoryQuery = useVendorsQuery({
    page: 1,
    limit: 100,
    includeDeleted: true,
  });
  const materialsQuery = useMaterialsQuery({ page: 1, limit: 100 });
  const stagesQuery = useStagesQuery();
  const createMutation = useCreateMaterialReceiptMutation();
  const updateMutation = useUpdateMaterialReceiptMutation();
  const verifyMutation = useVerifyMaterialReceiptMutation();
  const deleteMutation = useDeleteMaterialReceiptMutation();
  const restoreMutation = useRestoreMaterialReceiptMutation();

  const receipts = useMemo(() => {
    const items = receiptsQuery.data?.data.items ?? [];

    if (!includeDeleted) {
      return items.filter((receipt) => !receipt.isDeleted);
    }

    return items.filter((receipt) => receipt.isDeleted);
  }, [receiptsQuery.data?.data.items, includeDeleted]);

  const vendors = (vendorsQuery.data?.data ?? []).filter(
    (vendor) => !vendor.isDeleted && vendor.status === "ACTIVE",
  );
  const allVendors = useMemo(() => {
    const directory = vendorDirectoryQuery.data?.data.vendors ?? [];
    const byId = new Map(directory.map((vendor) => [vendor._id, vendor]));
    for (const vendor of vendors) byId.set(vendor._id, vendor);
    return [...byId.values()];
  }, [vendorDirectoryQuery.data?.data.vendors, vendors]);
  const formVendors = useMemo(() => {
    const byId = new Map(vendors.map((vendor) => [vendor._id, vendor]));
    const existingVendor =
      editingReceipt &&
      allVendors.find((vendor) => vendor._id === editingReceipt.vendorId);
    if (existingVendor) byId.set(existingVendor._id, existingVendor);
    return [...byId.values()];
  }, [allVendors, editingReceipt, vendors]);
  const materials = (materialsQuery.data?.data.materials ?? []).filter(
    (material) => !material.isDeleted,
  );
  const stages = (stagesQuery.data?.data ?? []).filter(
    (stage) => !stage.isDeleted,
  );
  const vendorNames = useMemo(
    () =>
      new Map(
        allVendors.map((vendor) => [
          vendor._id,
          `${vendor.name}${vendor.isDeleted ? " (deleted)" : vendor.status === "INACTIVE" ? " (inactive)" : ""}`,
        ]),
      ),
    [allVendors],
  );
  const materialNames = useMemo(
    () => new Map(materials.map((material) => [material._id, material.name])),
    [materials],
  );
  const stageNames = useMemo(
    () => new Map(stages.map((stage) => [stage._id, stage.name])),
    [stages],
  );

  const hasFilters = Boolean(
    search.trim() ||
    vendorId ||
    materialId ||
    stageId ||
    verificationStatus ||
    fromDate ||
    toDate ||
    includeDeleted,
  );
  const optionsLoading =
    vendorsQuery.isLoading || materialsQuery.isLoading || stagesQuery.isLoading;
  const optionsError =
    vendorsQuery.isError || materialsQuery.isError || stagesQuery.isError
      ? "Could not load vendors, materials, or stages. Please retry before saving a receipt."
      : undefined;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    const pagination = receiptsQuery.data?.data.pagination;
    if (!receiptsQuery.isSuccess || !pagination) return;
    const lastValidPage = Math.max(1, pagination.totalPages);
    if (page <= lastValidPage) return;

    const timeoutId = window.setTimeout(() => setPage(lastValidPage), 0);
    return () => window.clearTimeout(timeoutId);
  }, [page, receiptsQuery.data?.data.pagination, receiptsQuery.isSuccess]);

  const clearFilters = () => {
    setSearch("");
    setVendorId("");
    setMaterialId("");
    setStageId("");
    setVerificationStatus("");
    setFromDate("");
    setToDate("");
    setIncludeDeleted(false);
    setPage(1);
  };
  const openCreate = () => {
    setEditingReceipt(null);
    setFormOpen(true);
  };
  const closeForm = () => {
    if (!isSubmitting) {
      setFormOpen(false);
      setEditingReceipt(null);
    }
  };

  const handleSubmit = async (values: MaterialReceiptFormValues) => {
    const sharedPayload = {
      vendorId: values.vendorId,
      materialId: values.materialId,
      stageId: values.stageId,
      date: values.date,
      quantity: values.quantity,
      unit: values.unit,
      unitPrice: values.unitPrice,
    };
    try {
      if (editingReceipt) {
        const payload: UpdateMaterialReceiptRequest = {};
        if (values.vendorId !== editingReceipt.vendorId)
          payload.vendorId = values.vendorId;
        if (values.materialId !== editingReceipt.materialId)
          payload.materialId = values.materialId;
        if (values.stageId !== editingReceipt.stageId)
          payload.stageId = values.stageId;
        if (values.date !== editingReceipt.date.slice(0, 10))
          payload.date = values.date;
        if (values.quantity !== editingReceipt.quantity)
          payload.quantity = values.quantity;
        if (values.unit !== editingReceipt.unit) payload.unit = values.unit;
        if (values.unitPrice !== editingReceipt.unitPrice)
          payload.unitPrice = values.unitPrice;
        const notes = values.notes.trim();
        if (notes !== (editingReceipt.notes?.trim() ?? ""))
          payload.notes = notes || null;

        if (!Object.keys(payload).length) {
          toast.info("No receipt details were changed");
          setFormOpen(false);
          setEditingReceipt(null);
          return;
        }

        const response = await updateMutation.mutateAsync({
          receiptId: editingReceipt.id,
          payload,
        });
        toast.success(
          `${response.data.receiptNo} updated. Total: ${formatReceiptCurrency(response.data.totalAmount)}`,
        );
      } else {
        const notes = values.notes.trim();
        const response = await createMutation.mutateAsync({
          ...sharedPayload,
          ...(notes ? { notes } : {}),
        });
        toast.success(
          `${response.data.receiptNo} recorded. Total: ${formatReceiptCurrency(response.data.totalAmount)}`,
        );
      }
      setFormOpen(false);
      setEditingReceipt(null);
    } catch (error) {
      toast.error(
        getMutationErrorMessage(error, "Unable to save material receipt"),
      );
    }
  };

  const handleVerify = async (receipt: MaterialReceipt) => {
    try {
      const response = await verifyMutation.mutateAsync(receipt.id);
      toast.success(`${response.data.receiptNo} verified`);
    } catch (error) {
      toast.error(
        getMutationErrorMessage(error, "Unable to verify material receipt"),
      );
    }
  };

  const handleRestore = async (receipt: MaterialReceipt) => {
    try {
      const response = await restoreMutation.mutateAsync(receipt.id);
      toast.success(`${response.data.receiptNo} restored`);
    } catch (error) {
      toast.error(
        getMutationErrorMessage(error, "Unable to restore material receipt"),
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingReceipt) return;
    const deletedReceipt = deletingReceipt;
    try {
      const response = await deleteMutation.mutateAsync(deletedReceipt.id);
      setDeletingReceipt(null);
      toast(`${response.data.receiptNo} removed from the active list`, {
        action: {
          label: "Restore",
          onClick: () => {
            void handleRestore(response.data);
          },
        },
        duration: 10000,
      });
    } catch (error) {
      toast.error(
        getMutationErrorMessage(error, "Unable to remove material receipt"),
      );
    }
  };

  const detail = detailQuery.data?.data;
  const detailVendor = detail
    ? (vendorNames.get(detail.vendorId) ?? "Vendor unavailable")
    : "";
  const detailMaterial = detail
    ? (materialNames.get(detail.materialId) ?? "Material unavailable")
    : "";
  const detailStage = detail
    ? (stageNames.get(detail.stageId) ?? "Stage unavailable")
    : "";

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
      <div className="space-y-1">
        <MaterialReceiptHeader
          count={receiptsQuery.data?.data.pagination.total ?? 0}
          onAdd={openCreate}
        />
        <p className="text-sm text-muted-foreground">
          Track what arrived on site, its supplier, construction stage, and
          verified value.
        </p>
      </div>
      <MaterialReceiptFilters
        search={search}
        vendorId={vendorId}
        materialId={materialId}
        stageId={stageId}
        verificationStatus={verificationStatus}
        fromDate={fromDate}
        toDate={toDate}
        includeDeleted={includeDeleted}
        vendors={allVendors}
        materials={materials}
        stages={stages}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onVendorChange={(value) => {
          setVendorId(value);
          setPage(1);
        }}
        onMaterialChange={(value) => {
          setMaterialId(value);
          setPage(1);
        }}
        onStageChange={(value) => {
          setStageId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setVerificationStatus(value);
          setPage(1);
        }}
        onFromDateChange={(value) => {
          setFromDate(value);
          setPage(1);
        }}
        onToDateChange={(value) => {
          setToDate(value);
          setPage(1);
        }}
        onIncludeDeletedChange={(value) => {
          setIncludeDeleted(value);
          setPage(1);
        }}
        onClear={clearFilters}
      />

      {receiptsQuery.isFetching && !receiptsQuery.isLoading && (
        <p
          role="status"
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Updating results…
        </p>
      )}
      {receiptsQuery.isLoading && <MaterialReceiptLoadingState />}
      {receiptsQuery.isError && (
        <MaterialReceiptErrorState
          message="Unable to load material receipts. Check your connection and try again."
          onRetry={() => {
            void receiptsQuery.refetch();
          }}
        />
      )}
      {receiptsQuery.isSuccess && receipts.length === 0 && (
        <MaterialReceiptEmptyState
          hasFilters={hasFilters}
          onAdd={openCreate}
          onClear={clearFilters}
        />
      )}
      {receiptsQuery.isSuccess && receipts.length > 0 && (
        <>
          <MaterialReceiptList
            receipts={receipts}
            vendorNames={vendorNames}
            materialNames={materialNames}
            stageNames={stageNames}
            verifyingId={
              verifyMutation.isPending ? verifyMutation.variables : undefined
            }
            restoringId={
              restoreMutation.isPending ? restoreMutation.variables : undefined
            }
            onDetails={setDetailReceipt}
            onEdit={(receipt) => {
              setEditingReceipt(receipt);
              setFormOpen(true);
            }}
            onVerify={(receipt) => {
              void handleVerify(receipt);
            }}
            onDelete={setDeletingReceipt}
            onRestore={(receipt) => {
              void handleRestore(receipt);
            }}
          />
          {receiptsQuery.data.data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
              <button
                type="button"
                disabled={!receiptsQuery.data.data.pagination.hasPreviousPage}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 text-sm font-medium disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <span className="text-sm font-medium text-muted-foreground">
                Page {receiptsQuery.data.data.pagination.page} of{" "}
                {receiptsQuery.data.data.pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={!receiptsQuery.data.data.pagination.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 text-sm font-medium disabled:opacity-40"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
      <MaterialReceiptFormDialog
        open={formOpen}
        receipt={editingReceipt}
        vendors={formVendors}
        materials={materials}
        stages={stages}
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={closeForm}
      />
      <MaterialReceiptDeleteDialog
        receipt={deletingReceipt}
        isDeleting={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) setDeletingReceipt(null);
        }}
        onConfirm={() => {
          void handleDelete();
        }}
      />

      {detailReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailReceipt(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-detail-title"
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
          >
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {detail?.isDeleted
                    ? "Deleted material receipt"
                    : "Material receipt"}
                </p>
                <h2 id="receipt-detail-title" className="text-lg font-semibold">
                  {detail?.receiptNo ??
                    (detailQuery.isLoading
                      ? "Loading receipt…"
                      : "Receipt details")}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setDetailReceipt(null)}
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            {detailQuery.isLoading && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading receipt details…
              </div>
            )}
            {detailQuery.isError && (
              <MaterialReceiptErrorState
                message="Unable to load this receipt."
                onRetry={() => {
                  void detailQuery.refetch();
                }}
              />
            )}
            {detail && (
              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Date</dt>
                  <dd className="mt-1 font-medium">
                    {formatReceiptDate(detail.date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd className="mt-1 font-medium">
                    {VERIFICATION_STATUS_LABELS[detail.verificationStatus]}
                    {detail.isDeleted ? " · Deleted" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Material</dt>
                  <dd className="mt-1 font-medium">{detailMaterial}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Vendor</dt>
                  <dd className="mt-1 font-medium">{detailVendor}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Stage</dt>
                  <dd className="mt-1 font-medium">{detailStage}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Quantity and unit
                  </dt>
                  <dd className="mt-1 font-medium">
                    {detail.quantity} {formatReceiptUnit(detail.unit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Unit price</dt>
                  <dd className="mt-1 font-medium">
                    {formatReceiptCurrency(detail.unitPrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Total received value
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {formatReceiptCurrency(detail.totalAmount)}
                  </dd>
                </div>
                {detail.notes && (
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">Notes</dt>
                    <dd className="mt-1 whitespace-pre-wrap">{detail.notes}</dd>
                  </div>
                )}
              </dl>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
