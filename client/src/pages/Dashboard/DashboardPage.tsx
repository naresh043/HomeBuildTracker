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
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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

import { getDashboardApi } from "@/api/dashboard.api";
import type {
  DashboardStage,
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
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-28 rounded-2xl bg-muted" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-muted" />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-80 rounded-2xl bg-muted lg:col-span-2" />
        <div className="h-80 rounded-2xl bg-muted" />
      </div>

      <div className="h-96 rounded-2xl bg-muted" />
    </div>
  );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <ReceiptText className="h-6 w-6 text-destructive" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">Unable to load dashboard</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We couldn't retrieve the latest construction and financial
          information.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Try again
        </button>
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

        {inProgress && <p className="text-xs text-primary">In progress</p>}
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
          {formatDate(transaction.date)} · {transaction.method}
        </p>
      </div>

      <p className="shrink-0 text-sm font-bold">
        {formatCurrency(transaction.amount)}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardApi,
  });

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
      />
    );
  }

  const dashboard = dashboardQuery.data.data;

  const categoryChartData = dashboard.categories.breakdown.map((item) => ({
    name: categoryLabels[item.category] ?? item.category,
    value: item.amount,
  }));

  const currentStage = dashboard.house.currentStage;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
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
                  {dashboard.budget.utilization.againstMinimum.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  of minimum budget
                </p>
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    dashboard.budget.utilization.againstMinimum,
                    100,
                  )}%`,
                }}
              />
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
                {dashboard.stages.completed} of {dashboard.stages.total} stages
                completed
              </p>
            </div>

            <span className="text-xl font-bold">
              {dashboard.stages.progress}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(dashboard.stages.progress, 100)}%`,
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
          </div>

          {dashboard.contractors.balances.map((contract) => (
            <div
              key={contract.contractId}
              className="mt-4 flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {contract.vendor.name}
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
