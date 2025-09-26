interface MetaPanelProps {
  entries: { label: string; value: string }[];
}

export function MetaPanel({ entries }: MetaPanelProps) {
  return (
    <section className="rounded-lg border border-slate-700 bg-surface p-4">
      <h3 className="text-sm font-semibold text-gray-200">メタデータ</h3>
      <dl className="mt-3 space-y-2 text-xs text-gray-300">
        {entries.map((entry) => (
          <div key={entry.label} className="flex justify-between gap-4">
            <dt className="text-gray-400">{entry.label}</dt>
            <dd className="text-right break-words">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
