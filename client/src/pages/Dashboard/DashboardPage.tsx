import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Hammer,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useDashboardQuery } from "@/features/dashboard/dashboard.queries";
import { DatePicker } from "@/components/ui/date-picker";
import type {
  ActionRequiredItem,
  DashboardStage,
  FinancialHealthStatus,
  RecentTransaction,
} from "@/features/dashboard/dashboard.types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date: string) => format(new Date(date), "dd MMM yyyy");

const categoryLabels: Record<string, string> = {
  ADVANCE: "Advance",
  MATERIAL_PAYMENT: "Material payment",
  TRANSPORT: "Transport",
  SERVICE_PAYMENT: "Service payment",
  CONTRACT_PAYMENT: "Contract payment",
  OTHER: "Other",
};

function DashboardSkeleton() {
  const skeleton = "dashboard-skeleton";

  return (
    <div
      className="space-y-5"
      role="status"
      aria-live="polite"
      aria-label="Loading dashboard"
    >
      {/* Loading message */}
      <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className={`${skeleton} h-10 w-10 rounded-xl`} />

          <div className="min-w-0 flex-1">
            <div className={`${skeleton} h-4 w-44 rounded`} />
            <div className={`${skeleton} mt-2 h-3 w-64 max-w-full rounded`} />
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-foreground">
          Loading your construction dashboard…
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Preparing financial activity and construction progress.
        </p>
      </div>

      {/* Date filters */}
      <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className={`${skeleton} mb-2 h-3 w-20 rounded`} />
            <div className={`${skeleton} h-10 w-full rounded-xl`} />
          </div>

          <div>
            <div className={`${skeleton} mb-2 h-3 w-16 rounded`} />
            <div className={`${skeleton} h-10 w-full rounded-xl`} />
          </div>
        </div>
      </div>

      {/* House overview */}
      <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className={`${skeleton} h-4 w-32 rounded`} />
            <div
              className={`${skeleton} mt-3 h-8 w-56 max-w-full rounded-lg`}
            />
            <div className={`${skeleton} mt-2 h-3 w-36 rounded`} />
          </div>

          <div className={`${skeleton} h-9 w-28 rounded-full`} />
        </div>

        <div className={`${skeleton} mt-5 h-14 w-full rounded-xl`} />

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className={`${skeleton} h-20 rounded-xl`} />
          <div className={`${skeleton} h-20 rounded-xl`} />
        </div>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5"
          >
            <div className={`${skeleton} h-10 w-10 rounded-xl`} />
            <div className={`${skeleton} mt-4 h-3 w-24 rounded`} />
            <div
              className={`${skeleton} mt-2 h-7 w-28 max-w-full rounded-lg`}
            />
            <div
              className={`${skeleton} mt-2 h-3 w-32 max-w-full rounded`}
            />
          </div>
        ))}
      </div>

      {/* Financial health + verification */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
          <div className={`${skeleton} h-5 w-56 max-w-full rounded`} />
          <div className={`${skeleton} mt-2 h-3 w-72 max-w-full rounded`} />

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className={`${skeleton} h-16 rounded-xl`} />
            <div className={`${skeleton} h-16 rounded-xl`} />
            <div className={`${skeleton} h-16 rounded-xl`} />
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className={`${skeleton} h-5 w-40 rounded`} />
              <div className={`${skeleton} mt-2 h-3 w-52 max-w-full rounded`} />
            </div>

            <div className={`${skeleton} h-9 w-28 rounded-lg`} />
          </div>

          <div className={`${skeleton} mt-4 h-4 w-64 max-w-full rounded`} />
          <div className={`${skeleton} mt-2 h-3 w-40 rounded`} />
        </div>
      </div>

      {/* Action required */}
      <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className={`${skeleton} h-5 w-32 rounded`} />
          <div className={`${skeleton} h-4 w-20 rounded`} />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className={`${skeleton} h-16 rounded-xl`} />
          <div className={`${skeleton} h-16 rounded-xl`} />
        </div>
      </div>

      {/* Budget + construction */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className={`${skeleton} h-5 w-36 rounded`} />
              <div className={`${skeleton} mt-2 h-3 w-64 max-w-full rounded`} />
            </div>

            <div className={`${skeleton} h-5 w-5 rounded`} />
          </div>

          <div className="mt-6 flex items-end justify-between gap-3">
            <div>
              <div className={`${skeleton} h-8 w-32 rounded-lg`} />
              <div className={`${skeleton} mt-2 h-3 w-12 rounded`} />
            </div>

            <div className="text-right">
              <div className={`${skeleton} h-5 w-16 rounded`} />
              <div className={`${skeleton} mt-2 h-3 w-28 rounded`} />
            </div>
          </div>

          <div className={`${skeleton} mt-4 h-3 w-full rounded-full`} />

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className={`${skeleton} h-16 rounded-xl`} />
            <div className={`${skeleton} h-16 rounded-xl`} />
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className={`${skeleton} h-5 w-40 rounded`} />
              <div className={`${skeleton} mt-2 h-3 w-48 max-w-full rounded`} />
            </div>

            <div className={`${skeleton} h-6 w-14 rounded`} />
          </div>

          <div className={`${skeleton} mt-4 h-2 w-full rounded-full`} />

          <div className="mt-5 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`${skeleton} h-8 w-8 shrink-0 rounded-full`} />

                <div className="min-w-0 flex-1">
                  <div className={`${skeleton} h-3 w-32 max-w-full rounded`} />
                  <div
                    className={`${skeleton} mt-2 h-2.5 w-44 max-w-full rounded`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className={`${skeleton} h-5 w-36 rounded`} />
          <div className={`${skeleton} mt-2 h-3 w-52 max-w-full rounded`} />

          <div className="mt-5 flex h-64 items-end gap-3 sm:h-72">
            <div className={`${skeleton} h-[35%] flex-1 rounded-t-lg`} />
            <div className={`${skeleton} h-[55%] flex-1 rounded-t-lg`} />
            <div className={`${skeleton} h-[45%] flex-1 rounded-t-lg`} />
            <div className={`${skeleton} h-[75%] flex-1 rounded-t-lg`} />
            <div className={`${skeleton} h-[60%] flex-1 rounded-t-lg`} />
            <div className={`${skeleton} h-[85%] flex-1 rounded-t-lg`} />
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
          <div className={`${skeleton} h-5 w-40 rounded`} />
          <div className={`${skeleton} mt-2 h-3 w-48 max-w-full rounded`} />

          <div className="flex h-48 items-center justify-center">
            <div className={`${skeleton} h-36 w-36 rounded-full`} />
          </div>

          <div className="space-y-2">
            <div className={`${skeleton} h-4 w-full rounded`} />
            <div className={`${skeleton} h-4 w-4/5 rounded`} />
            <div className={`${skeleton} h-4 w-3/5 rounded`} />
          </div>
        </div>
      </div>

      {/* Supplier + contractor */}
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <div
            key={sectionIndex}
            className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className={`${skeleton} h-5 w-40 rounded`} />
                <div className={`${skeleton} mt-2 h-3 w-52 max-w-full rounded`} />
              </div>

              <div className={`${skeleton} h-5 w-5 rounded`} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`${skeleton} h-16 rounded-xl`} />
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={`${skeleton} h-14 rounded-xl`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className={`${skeleton} h-5 w-44 rounded`} />
            <div className={`${skeleton} mt-2 h-3 w-64 max-w-full rounded`} />
          </div>

          <div className={`${skeleton} h-5 w-5 rounded`} />
        </div>

        <div className="mt-4 divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-4">
              <div className={`${skeleton} h-10 w-10 shrink-0 rounded-xl`} />

              <div className="min-w-0 flex-1">
                <div className={`${skeleton} h-3 w-32 max-w-full rounded`} />
                <div
                  className={`${skeleton} mt-2 h-2.5 w-48 max-w-full rounded`}
                />
                <div
                  className={`${skeleton} mt-2 h-2.5 w-40 max-w-full rounded`}
                />
              </div>

              <div className={`${skeleton} h-4 w-20 shrink-0 rounded`} />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">
        Loading construction and financial dashboard...
      </span>
    </div>
  );
}

function DashboardError({ onRetry, message, houseUninitialized }: { onRetry: () => void; message: string; houseUninitialized: boolean }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <ReceiptText className="h-6 w-6 text-destructive" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">Unable to load dashboard</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Try again
        </button>
        {houseUninitialized && <Link to="/house" className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Set up your house</Link>}
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = "neutral",
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        {trend === "up" && (
          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
        )}

        {trend === "down" && (
          <ArrowDownRight className="h-4 w-4 text-orange-600" />
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>

        <p className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
          {value}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function StageRow({ stage }: { stage: DashboardStage }) {
  const completed = stage.status === "COMPLETED";
  const inProgress = stage.status === "IN_PROGRESS";

  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          completed
            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
            : inProgress
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-border bg-muted/50 text-muted-foreground",
        ].join(" ")}
      >
        {completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : inProgress ? (
          <Clock3 className="h-4 w-4" />
        ) : (
          <span className="text-xs font-semibold">{stage.order}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-sm font-medium",
            completed || inProgress
              ? "text-foreground"
              : "text-muted-foreground",
          ].join(" ")}
        >
          {stage.name}
        </p>

        <p className="text-xs text-muted-foreground">{stage.status.replaceAll("_", " ")}{stage.startDate ? ` · Started ${formatDate(stage.startDate)}` : ""}{stage.completionDate ? ` · Completed ${formatDate(stage.completionDate)}` : ""}</p>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: RecentTransaction }) {
  const isPayment = transaction.type === "PAYMENT";

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          isPayment
            ? "bg-blue-50 text-blue-600"
            : "bg-orange-50 text-orange-600",
        ].join(" ")}
      >
        {isPayment ? (
          <CreditCard className="h-5 w-5" />
        ) : (
          <ReceiptText className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {categoryLabels[transaction.category] ?? transaction.category}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {transaction.vendor?.name ?? transaction.notes ?? "No details"}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDate(transaction.date)} · {transaction.method}{transaction.reference ? ` · ${transaction.reference}` : ""}
        </p>
        {transaction.verificationStatus && <p className="mt-0.5 text-xs text-muted-foreground">Verification: {transaction.verificationStatus.replaceAll("_", " ")}</p>}
      </div>

      <p className="shrink-0 text-sm font-bold">
        {formatCurrency(transaction.amount)}
      </p>
    </div>
  );
}

function StageMilestone({ label, stage }: { label: string; stage: DashboardStage | null }) {
  return <div className="min-w-0 rounded-xl border bg-background p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{stage?.name ?? "Not available"}</p>{stage && <p className="mt-0.5 text-xs text-muted-foreground">Stage {stage.order}</p>}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-lg bg-muted/50 p-2 sm:p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold sm:text-base">{value}</p></div>;
}

const actionLabels: Record<ActionRequiredItem["type"], string> = {
  PAYMENT_VERIFICATION: "Payments needing verification",
  CONTRACTOR_OUTSTANDING: "Contractor balances outstanding",
  SUPPLIER_AMOUNT_OWED: "Supplier amounts owed",
  UNUSED_SUPPLIER_ADVANCE: "Unused supplier advances",
};
const actionRoutes: Record<ActionRequiredItem["type"], string> = {
  PAYMENT_VERIFICATION: "/payments",
  CONTRACTOR_OUTSTANDING: "/contracts",
  SUPPLIER_AMOUNT_OWED: "/supplier-agreements",
  UNUSED_SUPPLIER_ADVANCE: "/supplier-agreements",
};
function ActionItem({ item }: { item: ActionRequiredItem }) {
  return <Link to={actionRoutes[item.type]} className="flex min-h-16 items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="min-w-0"><span className="block break-words text-sm font-medium">{actionLabels[item.type]}</span><span className="mt-0.5 block text-xs text-muted-foreground">{item.count} {item.count === 1 ? "record" : "records"}</span></span><span className="shrink-0 text-sm font-semibold">{formatCurrency(item.amount)}</span></Link>;
}
function financialHealthMessage(status: FinancialHealthStatus): string {
  if (status === "HEALTHY") return "Finances are currently within the expected range.";
  if (status === "CRITICAL") return "Budget or payment issues require immediate attention.";
  return "Some payments or outstanding balances need attention.";
}

export default function DashboardPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const dashboardQuery = useDashboardQuery({ fromDate: fromDate || undefined, toDate: toDate || undefined });

  if (dashboardQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data?.success) {
    return (
      <DashboardError
        onRetry={() => {
          void dashboardQuery.refetch();
        }}
        message={axios.isAxiosError<{ message?: string }>(dashboardQuery.error) ? dashboardQuery.error.response?.data?.message ?? "We couldn't retrieve the latest construction and financial information." : "We couldn't retrieve the latest construction and financial information."}
        houseUninitialized={axios.isAxiosError<{ code?: string }>(dashboardQuery.error) && dashboardQuery.error.response?.data?.code === "HOUSE_NOT_INITIALIZED"}
      />
    );
  }

  const dashboard = dashboardQuery.data.data;

  const categoryChartData = dashboard.categories.breakdown.map((item) => ({
    name: categoryLabels[item.category] ?? item.category,
    value: item.amount,
  }));

  const currentStage = dashboard.construction.currentStage;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <section aria-label="Dashboard date range" className="grid grid-cols-1 gap-3 rounded-2xl border bg-background p-4 sm:grid-cols-2 sm:items-end">
        <div><span id="dashboard-from-date" className="mb-1.5 block text-sm font-medium">From date</span><DatePicker value={fromDate} onChange={setFromDate} ariaLabelledBy="dashboard-from-date" placeholder="All dates" maxDate={toDate ? new Date(`${toDate}T00:00:00`) : undefined} /></div>
        <div><span id="dashboard-to-date" className="mb-1.5 block text-sm font-medium">To date</span><DatePicker value={toDate} onChange={setToDate} ariaLabelledBy="dashboard-to-date" placeholder="All dates" minDate={fromDate ? new Date(`${fromDate}T00:00:00`) : undefined} /></div>
        {(fromDate || toDate) && <button type="button" onClick={() => { setFromDate(""); setToDate(""); }} className="min-h-10 justify-self-start rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-span-2">Clear date range</button>}
      </section>
      {/* Header */}
      <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Building2 className="h-4 w-4" />
              Home construction
            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {dashboard.house.name}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Started {formatDate(dashboard.house.startDate)}
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {dashboard.house.status.replaceAll("_", " ")}
          </div>
        </div>

        {currentStage && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Hammer className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Current stage
              </p>

              <p className="truncate text-sm font-semibold">
                {currentStage.name}
              </p>
            </div>
          </div>
        )}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <StageMilestone label="Last completed" stage={dashboard.construction.lastCompletedStage} />
          <StageMilestone label="Next not started" stage={dashboard.construction.nextStage} />
        </div>
      </section>

      {/* Financial summary */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Total spending"
          value={formatCurrency(dashboard.financial.totalSpending)}
          subtitle="Payments + other expenses"
          icon={Wallet}
          trend="up"
        />

        <SummaryCard
          title="Total paid"
          value={formatCurrency(dashboard.financial.totalPaid)}
          subtitle="Money paid so far"
          icon={Banknote}
        />

        <SummaryCard
          title="Other expenses"
          value={formatCurrency(dashboard.financial.totalOtherExpenses)}
          subtitle="Non-payment expenses"
          icon={ReceiptText}
        />

        <SummaryCard
          title="Outstanding"
          value={formatCurrency(dashboard.financial.outstanding.total)}
          subtitle="Contractors + suppliers"
          icon={CircleDollarSign}
          trend="down"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
          <h2 className="font-semibold">Financial health: {dashboard.financialHealth.status.replaceAll("_", " ")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{financialHealthMessage(dashboard.financialHealth.status)}</p>
          <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3"><Metric label="Spent" value={formatCurrency(dashboard.financialHealth.totalSpent)} /><Metric label="Paid" value={formatCurrency(dashboard.financialHealth.totalPaid)} /><Metric label="Outstanding" value={formatCurrency(dashboard.financialHealth.totalOutstanding)} /></div>
        </div>
        <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Payment verification</h2><p className="mt-1 text-sm text-muted-foreground">{dashboard.verification.totalPayments} payments · {dashboard.verification.verified} verified</p></div>{dashboard.verification.needsVerification > 0 && <Link to="/payments" className="inline-flex min-h-10 items-center rounded-lg border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Review payments</Link>}</div>
          <p className="mt-3 text-sm">{dashboard.verification.needsVerification} need verification · {formatCurrency(dashboard.verification.needsVerificationAmount)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Verified amount: {formatCurrency(dashboard.verification.verifiedAmount)}</p>
        </div>
      </section>

      <section aria-labelledby="action-required-title" className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
        <div className="flex items-baseline justify-between gap-3"><h2 id="action-required-title" className="text-base font-semibold">Action required</h2><span className="text-sm text-muted-foreground">{dashboard.actionRequired.count} records</span></div>
        {dashboard.actionRequired.items.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{dashboard.actionRequired.items.map((item) => <ActionItem key={item.type} item={item} />)}</div> : <p className="mt-3 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">Nothing needs attention right now.</p>}
      </section>

      {/* Budget + construction */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Budget overview</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Current spending against your planned budget.
              </p>
            </div>

            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {formatCurrency(dashboard.budget.spent)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">spent</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold">
                  {dashboard.budget.utilization.againstMaximum.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  of maximum budget
                </p>
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    dashboard.budget.utilization.againstMaximum,
                    100,
                  )}%`,
                }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm" role="status">
              <span className="font-medium">Budget status: {dashboard.budget.health.replaceAll("_", " ")}</span>
              <span className="text-muted-foreground">{formatCurrency(dashboard.budget.remainingMaximum)} remaining to maximum</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Minimum budget</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(dashboard.budget.minimum)}
                </p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Maximum budget</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(dashboard.budget.maximum)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold">Construction progress</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {dashboard.construction.completedStages} completed · {dashboard.construction.inProgressStages} in progress · {dashboard.construction.notStartedStages} not started · {dashboard.construction.onHoldStages} on hold
              </p>
            </div>

            <span className="text-xl font-bold">
              {dashboard.construction.progress}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Construction progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dashboard.construction.progress}>
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(dashboard.construction.progress, 100)}%`,
              }}
            />
          </div>

          <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
            {dashboard.stages.items.map((stage) => (
              <StageRow key={stage.id} stage={stage} />
            ))}
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div>
            <h2 className="text-base font-semibold">Monthly spending</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Construction spending by month.
            </p>
          </div>

          <div className="mt-5 h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.monthly.spending}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Spending",
                  ]}
                />

                <Bar
                  dataKey="amount"
                  radius={[6, 6, 0, 0]}
                  fill="currentColor"
                  className="text-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-base font-semibold">Spending breakdown</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Where the money is going.
            </p>
          </div>

          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {categoryChartData.map((item, index) => (
                    <Cell
                      key={`${item.name}-${index}`}
                      fill={`hsl(${220 + index * 35} 70% ${55 - index * 3}%)`}
                    />
                  ))}
                </Pie>

                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {categoryChartData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate text-muted-foreground">
                  {item.name}
                </span>

                <span className="font-semibold">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supplier / contractor */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Supplier summary</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Payments and material received.
              </p>
            </div>

            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>

          <p className="mt-1 text-xs text-muted-foreground">{dashboard.suppliers.totalSuppliers} active suppliers</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="mt-1 text-lg font-bold">
                {formatCurrency(dashboard.suppliers.totalPaid)}
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Material received</p>
              <p className="mt-1 text-lg font-bold">
                {formatCurrency(dashboard.suppliers.totalMaterialReceived)}
              </p>
            </div>
            <Metric label="Unused advances" value={formatCurrency(dashboard.suppliers.totalUnusedAdvance)} />
            <Metric label="Amount owed" value={formatCurrency(dashboard.suppliers.totalAmountOwed)} />
          </div>

          {dashboard.suppliers.balances.map((supplier) => (
            <div
              key={supplier.vendorId}
              className="mt-4 flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {supplier.vendor.name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {supplier.balanceType === "UNUSED_ADVANCE"
                    ? "Unused advance"
                    : "Amount owed"}
                </p>
              </div>

              <p className="shrink-0 text-sm font-bold">
                {formatCurrency(supplier.balance)}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Contractor summary</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Contract value and outstanding payments.
              </p>
            </div>

            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Contract value</p>

              <p className="mt-1 text-lg font-bold">
                {formatCurrency(dashboard.contractors.totalContractValue)}
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Outstanding</p>

              <p className="mt-1 text-lg font-bold">
                {formatCurrency(dashboard.contractors.totalOutstanding)}
              </p>
            </div>
            <Metric label="Contracts" value={String(dashboard.contractors.totalContracts)} />
            <Metric label="Paid" value={formatCurrency(dashboard.contractors.totalPaid)} />
          </div>

          {dashboard.contractors.balances.map((contract) => (
            <div
              key={contract.contractId}
              className="mt-4 flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {contract.vendor?.name ?? "Vendor unavailable"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {contract.contractType} · {contract.status}
                </p>
              </div>

              <p className="shrink-0 text-sm font-bold">
                {formatCurrency(contract.outstanding)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent transactions */}
      <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Recent transactions</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Latest construction-related money movements.
            </p>
          </div>

          <CalendarDays className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="mt-4 divide-y">
          {dashboard.recentTransactions.length > 0 ? (
            dashboard.recentTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No recent transactions.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
