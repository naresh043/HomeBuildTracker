import ExpenseCard from "@/components/expenses/ExpenseCard";
import type { Expense } from "@/features/expenses/expense.types";

interface Props {
  expenses: Expense[];
  stageNames: Map<string, string>;
  restoringId?: string;
  onDetails: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onRestore: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, stageNames, restoringId, onDetails, onEdit, onDelete, onRestore }: Props) {
  return (
    <section aria-label="Expenses" className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
      {expenses.map((expense) => <ExpenseCard key={expense.id} expense={expense} stageName={expense.stageId ? stageNames.get(expense.stageId) ?? "Stage unavailable" : "No stage"} isRestoring={restoringId === expense.id} onDetails={onDetails} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />)}
    </section>
  );
}
