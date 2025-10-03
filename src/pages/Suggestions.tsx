import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useSuggestionsStore } from '../stores/suggestions';

export const SuggestionsPage = () => {
  const suggestions = useSuggestionsStore((state) => state.suggestions);
  const approve = useSuggestionsStore((state) => state.approve);
  const reject = useSuggestionsStore((state) => state.reject);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {suggestions.map((suggestion) => (
        <Card key={suggestion.id} className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-accent">{suggestion.title}</h3>
            <p className="mt-1 text-xs text-white/60">提案理由: {suggestion.reason}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/60">
            <span>想定時間: {suggestion.estMinutes}分</span>
            <span>難易度: {'★'.repeat(suggestion.difficulty)}</span>
            {suggestion.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/10 px-2 py-1">
                #{tag}
              </span>
            ))}
          </div>
          <Badge
            variant={
              suggestion.decision === 'approved'
                ? 'done'
                : suggestion.decision === 'rejected'
                ? 'pending'
                : 'progress'
            }
          >
            {suggestion.decision === 'pending'
              ? '保留中'
              : suggestion.decision === 'approved'
              ? '採用'
              : '却下'}
          </Badge>
          <div className="mt-auto flex gap-2">
            <Button
              variant="secondary"
              onClick={() => approve(suggestion.id)}
              disabled={suggestion.decision === 'approved'}
              aria-label={`${suggestion.title}を承認`}
            >
              承認
            </Button>
            <Button
              variant="ghost"
              onClick={() => reject(suggestion.id)}
              disabled={suggestion.decision === 'rejected'}
              aria-label={`${suggestion.title}を拒否`}
            >
              拒否
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
