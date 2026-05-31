import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data yet', description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-primary-50 hover:text-primary-500">
        <Inbox className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-slate-400">{description}</p>}
    </div>
  );
}
