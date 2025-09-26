interface ImageCardProps {
  title: string;
  subtitle?: string;
  url: string;
}

export function ImageCard({ title, subtitle, url }: ImageCardProps) {
  return (
    <figure className="rounded-lg bg-surface p-4 shadow-lg border border-slate-700">
      <img src={url} alt={title} className="h-40 w-full object-cover rounded" />
      <figcaption className="mt-3 text-sm text-gray-200">
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      </figcaption>
    </figure>
  );
}
