import type { Receipt } from "@/features/receipts/receipt.types";
import ReceiptCard from "./ReceiptCard";
interface Props { receipts: Receipt[]; isRestoring: boolean; onDetails:(r:Receipt)=>void; onLink:(r:Receipt)=>void; onUnlink:(r:Receipt)=>void; onDelete:(r:Receipt)=>void; onRestore:(r:Receipt)=>void }
export default function ReceiptList(p:Props){return <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">{p.receipts.map(r=><ReceiptCard key={r._id} receipt={r} isRestoring={p.isRestoring} onDetails={p.onDetails} onLink={p.onLink} onUnlink={p.onUnlink} onDelete={p.onDelete} onRestore={p.onRestore}/>)}</div>}
