import { ImageCard } from './image-card';

const samples = [
  {
    title: '家族の集合写真',
    subtitle: 'モノクロ → カラー',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=60'
  },
  {
    title: '街角スナップ',
    subtitle: 'スキャン画像',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=60'
  },
  {
    title: '祖父母の肖像',
    subtitle: '古い写真をカラー化',
    url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=60'
  }
];

export function Gallery() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {samples.map((sample) => (
        <ImageCard key={sample.title} {...sample} />
      ))}
    </div>
  );
}
