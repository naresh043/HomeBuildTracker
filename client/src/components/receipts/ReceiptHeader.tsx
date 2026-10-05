import { Upload } from "lucide-react";
export default function ReceiptHeader({ count, onUpload }: { count: number; onUpload: () => void }) {
  return <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Receipts</h1><p className="mt-1 text-sm text-muted-foreground">Supporting documents for payments, material receipts, and expenses · {count}</p></div><button type="button" onClick={onUpload} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-medium text-primary-foreground hover:opacity-90"><Upload className="h-4 w-4"/>Upload Receipt</button></header>;
}
