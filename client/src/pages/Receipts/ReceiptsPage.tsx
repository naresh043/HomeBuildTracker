import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

import ReceiptDeleteDialog from "@/components/receipts/ReceiptDeleteDialog";
import ReceiptDetailsDialog from "@/components/receipts/ReceiptDetailsDialog";
import ReceiptEmptyState from "@/components/receipts/ReceiptEmptyState";
import ReceiptErrorState from "@/components/receipts/ReceiptErrorState";
import ReceiptFilters from "@/components/receipts/ReceiptFilters";
import ReceiptHeader from "@/components/receipts/ReceiptHeader";
import ReceiptLinkDialog from "@/components/receipts/ReceiptLinkDialog";
import ReceiptList from "@/components/receipts/ReceiptList";
import ReceiptLoadingState from "@/components/receipts/ReceiptLoadingState";
import ReceiptPagination from "@/components/receipts/ReceiptPagination";
import ReceiptUnlinkDialog from "@/components/receipts/ReceiptUnlinkDialog";
import ReceiptUploadDialog from "@/components/receipts/ReceiptUploadDialog";

import {
  useDeleteReceiptMutation,
  useLinkReceiptMutation,
  useRestoreReceiptMutation,
  useUnlinkReceiptMutation,
  useUploadReceiptMutation,
} from "@/features/receipts/receipt.mutations";

import { useReceiptsQuery } from "@/features/receipts/receipt.queries";

import type {
  Receipt,
  ReceiptFileType,
  ReceiptLinkPayload,
  ReceiptSourceType,
  ReceiptUnlinkPayload,
} from "@/features/receipts/receipt.types";

import type { ReceiptUploadValues } from "@/features/receipts/receipt.schema";

const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? fallback)
    : error instanceof Error
      ? error.message
      : fallback;

type LinkKind = "payment" | "materialReceipt" | "expense";

const linkPayload = (
  kind: LinkKind,
  id: string,
): ReceiptLinkPayload =>
  kind === "payment"
    ? { paymentId: id }
    : kind === "materialReceipt"
      ? { materialReceiptId: id }
      : { expenseId: id };

const unlinkPayload = (
  kind: LinkKind,
  id: string,
): ReceiptUnlinkPayload => linkPayload(kind, id);

export default function ReceiptsPage() {
  const [search, setSearch] = useState("");

  const [sourceType, setSourceType] = useState<
    ReceiptSourceType | ""
  >("");

  const [fileType, setFileType] = useState<
    ReceiptFileType | ""
  >("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deletedOnly, setDeletedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [details, setDetails] = useState<Receipt | null>(null);
  const [linking, setLinking] = useState<Receipt | null>(null);
  const [unlinking, setUnlinking] = useState<Receipt | null>(null);
  const [deleting, setDeleting] = useState<Receipt | null>(null);

  const [uploadError, setUploadError] = useState("");

  const params = {
    ...(search.trim() ? { q: search.trim() } : {}),
    ...(sourceType ? { sourceType } : {}),
    ...(fileType ? { fileType } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
    ...(deletedOnly ? { includeDeleted: true } : {}),
    page,
    limit: 20,
  };

  const list = useReceiptsQuery(params);

  const items = list.data?.data.items ?? [];

  /*
   * The API's includeDeleted flag includes both active and deleted items.
   * Keep the deleted-only view strict on every displayed page.
   */
  const visibleItems = deletedOnly
    ? items.filter((item) => item.isDeleted)
    : items.filter((item) => !item.isDeleted);

  const upload = useUploadReceiptMutation();
  const remove = useDeleteReceiptMutation();
  const restore = useRestoreReceiptMutation();
  const link = useLinkReceiptMutation();
  const unlink = useUnlinkReceiptMutation();

  const changeFilter = (
    key:
      | "search"
      | "sourceType"
      | "fileType"
      | "fromDate"
      | "toDate"
      | "deletedOnly",
    value: string | boolean,
  ) => {
    setPage(1);

    switch (key) {
      case "search":
        setSearch(value as string);
        break;

      case "sourceType":
        setSourceType(value as ReceiptSourceType | "");
        break;

      case "fileType":
        setFileType(value as ReceiptFileType | "");
        break;

      case "fromDate":
        setFromDate(value as string);
        break;

      case "toDate":
        setToDate(value as string);
        break;

      case "deletedOnly":
        setDeletedOnly(value as boolean);
        break;
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSourceType("");
    setFileType("");
    setFromDate("");
    setToDate("");
    setDeletedOnly(false);
    setPage(1);
  };

  const submitUpload = async (values: ReceiptUploadValues) => {
    setUploadError("");

    try {
      await upload.mutateAsync(values);

      setPage(1);
      toast.success("Receipt uploaded successfully");
      setUploadOpen(false);
    } catch (error) {
      setUploadError(
        getErrorMessage(error, "Unable to upload receipt"),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleting) {
      return;
    }

    try {
      await remove.mutateAsync(deleting._id);

      setPage(1);
      setDeleting(null);
      setDetails(null);

      toast.success("Receipt deleted successfully");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to delete receipt"),
      );
    }
  };

  const restoreReceipt = async (receipt: Receipt) => {
    try {
      await restore.mutateAsync(receipt._id);

      setPage(1);

      toast.success("Receipt restored successfully");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to restore receipt"),
      );
    }
  };

  const doLink = async (kind: LinkKind, id: string) => {
    if (!linking) {
      return;
    }

    try {
      await link.mutateAsync({
        id: linking._id,
        payload: linkPayload(kind, id),
      });

      setLinking(null);

      toast.success("Receipt linked successfully");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to link receipt"),
      );
    }
  };

  const doUnlink = async (kind: LinkKind, id: string) => {
    if (!unlinking) {
      return;
    }

    try {
      await unlink.mutateAsync({
        id: unlinking._id,
        payload: unlinkPayload(kind, id),
      });

      setUnlinking(null);

      toast.success("Receipt unlinked successfully");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to unlink receipt"),
      );
    }
  };

  return (
    <div className="mx-auto flex max-w-[1600px] min-w-0 flex-col gap-5 p-4 sm:p-6">
      <ReceiptHeader
        count={list.data?.data.pagination.total ?? 0}
        onUpload={() => {
          setUploadError("");
          setUploadOpen(true);
        }}
      />

      <ReceiptFilters
        search={search}
        sourceType={sourceType}
        fileType={fileType}
        fromDate={fromDate}
        toDate={toDate}
        deletedOnly={deletedOnly}
        onChange={changeFilter}
        onClear={clearFilters}
      />

      {list.isLoading ? (
        <ReceiptLoadingState />
      ) : list.isError ? (
        <ReceiptErrorState
          message={getErrorMessage(
            list.error,
            "Check your connection and try again.",
          )}
          onRetry={() => void list.refetch()}
        />
      ) : visibleItems.length === 0 ? (
        <ReceiptEmptyState deletedOnly={deletedOnly} />
      ) : (
        <ReceiptList
          receipts={visibleItems}
          isRestoring={restore.isPending}
          onDetails={setDetails}
          onLink={setLinking}
          onUnlink={setUnlinking}
          onDelete={setDeleting}
          onRestore={restoreReceipt}
        />
      )}

      <ReceiptPagination
        page={page}
        pages={list.data?.data.pagination.pages ?? 0}
        onChange={setPage}
      />

      <ReceiptUploadDialog
        open={uploadOpen}
        isUploading={upload.isPending}
        onUpload={submitUpload}
        onClose={() => setUploadOpen(false)}
        error={uploadError}
      />

      <ReceiptDetailsDialog
        receipt={details}
        onClose={() => setDetails(null)}
      />

      <ReceiptLinkDialog
        key={linking?._id ?? "closed"}
        receipt={linking}
        isLinking={link.isPending}
        onLink={(kind, id) => void doLink(kind, id)}
        onClose={() => setLinking(null)}
      />

      <ReceiptUnlinkDialog
        key={unlinking?._id ?? "closed"}
        receipt={unlinking}
        isUnlinking={unlink.isPending}
        onUnlink={(kind, id) => void doUnlink(kind, id)}
        onClose={() => setUnlinking(null)}
      />

      <ReceiptDeleteDialog
        receipt={deleting}
        isDeleting={remove.isPending}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}