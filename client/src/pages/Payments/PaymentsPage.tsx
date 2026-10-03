// import {
//   AlertCircle,
//   Loader2,
//   Plus,
//   Search,
//   X,
// } from "lucide-react";
// import { useMemo, useState } from "react";
// import { toast } from "sonner";

// import { useSelector } from "react-redux";

// import PaymentCard from "@/components/payments/PaymentCard";

// import {
//   useActiveVendorsQuery,
//   usePaymentsQuery,
//   useStagesQuery,
// } from "@/features/payments/payment.queries";

// import {
//   useCreatePaymentMutation,
//   useDeletePaymentMutation,
//   useUpdatePaymentMutation,
//   useVerifyPaymentMutation,
// } from "@/features/payments/payment.mutations";

// import type {
//   Payment,
//   PaymentListParams,
// } from "@/features/payments/payment.types";

// import { calculatePaymentTotals } from "@/features/payments/payment.utils";

// import { paymentSchema } from "@/features/payments/payment.schema";

// import { useAppSelector } from "@/store/hooks";

// export default function PaymentsPage() {
//   const user = useAppSelector(
//     (state) => state.auth.user,
//   );

//   const [search, setSearch] = useState("");

//   const [paymentType, setPaymentType] =
//     useState<PaymentListParams["paymentType"]>();

//   const [method, setMethod] =
//     useState<PaymentListParams["method"]>();

//   const [isFormOpen, setIsFormOpen] =
//     useState(false);

//   const [editingPayment, setEditingPayment] =
//     useState<Payment | null>(null);

//   const params = useMemo<PaymentListParams>(
//     () => ({
//       page: 1,
//       limit: 50,
//       q: search.trim() || undefined,
//       paymentType,
//       method,
//     }),
//     [search, paymentType, method],
//   );

//   const paymentsQuery =
//     usePaymentsQuery(params);

//   const vendorsQuery =
//     useActiveVendorsQuery();

//   const stagesQuery =
//     useStagesQuery();

//   const createMutation =
//     useCreatePaymentMutation();

//   const updateMutation =
//     useUpdatePaymentMutation();

//   const verifyMutation =
//     useVerifyPaymentMutation();

//   const deleteMutation =
//     useDeletePaymentMutation();

//   const payments =
//     paymentsQuery.data?.data ?? [];

//   const totals =
//     calculatePaymentTotals(payments);

//   const isSubmitting =
//     createMutation.isPending ||
//     updateMutation.isPending;

//   const openCreateForm = () => {
//     setEditingPayment(null);
//     setIsFormOpen(true);
//   };

//   const openEditForm = (
//     payment: Payment,
//   ) => {
//     setEditingPayment(payment);
//     setIsFormOpen(true);
//   };

//   const closeForm = () => {
//     setIsFormOpen(false);
//     setEditingPayment(null);
//   };

//   const handleVerify = async (
//     payment: Payment,
//   ) => {
//     try {
//       await verifyMutation.mutateAsync(
//         payment._id,
//       );

//       toast.success(
//         "Payment verified successfully.",
//       );
//     } catch (error) {
//       toast.error(
//         getErrorMessage(
//           error,
//           "Failed to verify payment.",
//         ),
//       );
//     }
//   };

//   const handleDelete = async (
//     payment: Payment,
//   ) => {
//     const confirmed = window.confirm(
//       `Delete ${payment.paymentNo}?`,
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       await deleteMutation.mutateAsync(
//         payment._id,
//       );

//       toast.success(
//         "Payment deleted successfully.",
//       );
//     } catch (error) {
//       toast.error(
//         getErrorMessage(
//           error,
//           "Failed to delete payment.",
//         ),
//       );
//     }
//   };

//   const clearFilters = () => {
//     setSearch("");
//     setPaymentType(undefined);
//     setMethod(undefined);
//   };

//   const hasFilters =
//     Boolean(search) ||
//     Boolean(paymentType) ||
//     Boolean(method);

//   return (
//     <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">
//             Payments
//           </h1>

//           <p className="mt-1 text-sm text-muted-foreground">
//             Track money paid during house construction.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={openCreateForm}
//           className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
//         >
//           <Plus className="h-4 w-4" />
//           Add Payment
//         </button>
//       </div>

//       <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//         <SummaryCard
//           label="Total Paid"
//           value={formatCurrency(totals.total)}
//         />

//         <SummaryCard
//           label="Verified"
//           value={formatCurrency(totals.verified)}
//         />

//         <SummaryCard
//           label="Needs Verification"
//           value={formatCurrency(
//             totals.needsVerification,
//           )}
//         />

//         <SummaryCard
//           label="Payments"
//           value={String(totals.count)}
//         />
//       </section>

//       <section className="rounded-xl border bg-card p-4 shadow-sm">
//         <div className="flex flex-col gap-3 lg:flex-row">
//           <div className="relative min-w-0 flex-1">
//             <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

//             <input
//               value={search}
//               onChange={(event) =>
//                 setSearch(event.target.value)
//               }
//               placeholder="Search payment number..."
//               className="h-11 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
//             />
//           </div>

//           <select
//             value={paymentType ?? ""}
//             onChange={(event) =>
//               setPaymentType(
//                 event.target.value
//                   ? (event.target.value as PaymentListParams["paymentType"])
//                   : undefined,
//               )
//             }
//             className="h-11 rounded-lg border bg-background px-3 text-sm"
//           >
//             <option value="">
//               All payment types
//             </option>

//             <option value="ADVANCE">
//               Advance
//             </option>

//             <option value="CONTRACT_PAYMENT">
//               Contract Payment
//             </option>

//             <option value="MATERIAL_PAYMENT">
//               Material Payment
//             </option>

//             <option value="SERVICE_PAYMENT">
//               Service Payment
//             </option>

//             <option value="OTHER">
//               Other
//             </option>
//           </select>

//           <select
//             value={method ?? ""}
//             onChange={(event) =>
//               setMethod(
//                 event.target.value
//                   ? (event.target.value as PaymentListParams["method"])
//                   : undefined,
//               )
//             }
//             className="h-11 rounded-lg border bg-background px-3 text-sm"
//           >
//             <option value="">
//               All methods
//             </option>

//             <option value="CASH">
//               Cash
//             </option>

//             <option value="UPI">
//               UPI
//             </option>

//             <option value="BANK_TRANSFER">
//               Bank Transfer
//             </option>

//             <option value="CHEQUE">
//               Cheque
//             </option>
//           </select>

//           {hasFilters && (
//             <button
//               type="button"
//               onClick={clearFilters}
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
//             >
//               <X className="h-4 w-4" />
//               Clear
//             </button>
//           )}
//         </div>
//       </section>

//       {paymentsQuery.isLoading && (
//         <div className="flex min-h-48 items-center justify-center rounded-xl border bg-card">
//           <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
//         </div>
//       )}

//       {paymentsQuery.isError && (
//         <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
//           <div className="flex gap-3">
//             <AlertCircle className="h-5 w-5 text-destructive" />

//             <div>
//               <p className="font-medium">
//                 Failed to load payments
//               </p>

//               <p className="mt-1 text-sm text-muted-foreground">
//                 {getErrorMessage(
//                   paymentsQuery.error,
//                   "Please try again.",
//                 )}
//               </p>

//               <button
//                 type="button"
//                 onClick={() =>
//                   paymentsQuery.refetch()
//                 }
//                 className="mt-3 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {!paymentsQuery.isLoading &&
//         !paymentsQuery.isError && (
//           <>
//             {payments.length === 0 ? (
//               <div className="rounded-xl border bg-card p-10 text-center">
//                 <p className="font-semibold">
//                   No payments found
//                 </p>

//                 <p className="mt-1 text-sm text-muted-foreground">
//                   Add your first construction payment.
//                 </p>

//                 <button
//                   type="button"
//                   onClick={openCreateForm}
//                   className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
//                 >
//                   <Plus className="h-4 w-4" />
//                   Add Payment
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {payments.map((payment) => (
//                   <PaymentCard
//                     key={payment._id}
//                     payment={payment}
//                     onEdit={openEditForm}
//                     onVerify={handleVerify}
//                     onDelete={handleDelete}
//                   />
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//       {isFormOpen && (
//         <PaymentFormPlaceholder
//           payment={editingPayment}
//           vendors={vendorsQuery.data?.data ?? []}
//           stages={stagesQuery.data?.data ?? []}
//           currentUserId={user?.id ?? ""}
//           isSubmitting={isSubmitting}
//           onClose={closeForm}
//           onSubmit={async (values) => {
//             if (!user?.id) {
//               toast.error(
//                 "User session not found.",
//               );
//               return;
//             }

//             try {
//               const payload = {
//                 date: values.date,
//                 amount: values.amount,
//                 paidByUserId: user.id,
//                 paidToVendorId:
//                   values.paidToVendorId,
//                 paymentType:
//                   values.paymentType,
//                 method: values.method,
//                 upiApp:
//                   values.method === "UPI"
//                     ? values.upiApp
//                     : undefined,
//                 transactionReference:
//                   values.method === "UPI"
//                     ? values.transactionReference
//                     : undefined,
//                 stageId: values.stageId,
//                 notes: values.notes || undefined,
//               };

//               if (editingPayment) {
//                 await updateMutation.mutateAsync({
//                   paymentId:
//                     editingPayment._id,
//                   payload,
//                 });

//                 toast.success(
//                   "Payment updated successfully.",
//                 );
//               } else {
//                 await createMutation.mutateAsync(
//                   payload,
//                 );

//                 toast.success(
//                   "Payment created successfully.",
//                 );
//               }

//               closeForm();
//             } catch (error) {
//               toast.error(
//                 getErrorMessage(
//                   error,
//                   "Failed to save payment.",
//                 ),
//               );
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// }

// function SummaryCard({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="rounded-xl border bg-card p-4 shadow-sm">
//       <p className="text-xs font-medium text-muted-foreground">
//         {label}
//       </p>

//       <p className="mt-1 text-lg font-semibold">
//         {value}
//       </p>
//     </div>
//   );
// }

// function formatCurrency(
//   amount: number,
// ) {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(amount);
// }

// function getErrorMessage(
//   error: unknown,
//   fallback: string,
// ) {
//   if (
//     typeof error === "object" &&
//     error !== null &&
//     "response" in error
//   ) {
//     const response = (
//       error as {
//         response?: {
//           data?: {
//             message?: string;
//           };
//         };
//       }
//     ).response;

//     if (response?.data?.message) {
//       return response.data.message;
//     }
//   }

//   if (
//     error instanceof Error &&
//     error.message
//   ) {
//     return error.message;
//   }

//   return fallback;
// }