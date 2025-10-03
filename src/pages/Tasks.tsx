import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { useTasksStore } from '../stores/tasks';
import { TaskStatus } from '../types';

const tags = ['all', 'health', 'study', 'work'] as const;

const statusLabel: Record<TaskStatus, string> = {
  pending: '未着手',
  in_progress: '進行中',
  done: '完了',
  milestone: 'マイルストーン'
};

type TagFilter = (typeof tags)[number];

type TaskFormState = {
  title: string;
  description: string;
  difficulty: number;
  tags: string[];
};

const emptyForm: TaskFormState = {
  title: '',
  description: '',
  difficulty: 2,
  tags: []
};

export const TasksPage = () => {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<TagFilter>('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const tasks = useTasksStore((state) => state.tasks);
  const completeTask = useTasksStore((state) => state.completeTask);
  const addTask = useTasksStore((state) => state.addTask);

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      const matchesTag = tag === 'all' || task.tags.includes(tag);
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [tasks, tag, search]);

  const handleSubmit = () => {
    addTask({
      title: form.title,
      description: form.description,
      difficulty: form.difficulty,
      tags: form.tags,
      status: 'in_progress',
      dependsOn: []
    });
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="タスク検索"
          aria-label="タスク検索"
          className="focus-ring w-full max-w-xs rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
        />
        <div className="flex gap-2 text-xs">
          {tags.map((value) => (
            <button
              key={value}
              onClick={() => setTag(value)}
              className={`focus-ring rounded-full px-4 py-1 transition ${
                tag === value ? 'bg-accent text-[#0B1020]' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              aria-label={`${value}タグでフィルタ`}
            >
              #{value}
            </button>
          ))}
        </div>
        <Button onClick={() => setOpen(true)} aria-label="新規タスク登録">
          新規登録
        </Button>
      </Card>
      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead>
            <tr className="bg-white/5">
              <th className="table-header px-4 py-3">タスク</th>
              <th className="table-header px-4 py-3">タグ</th>
              <th className="table-header px-4 py-3">難易度</th>
              <th className="table-header px-4 py-3">状態</th>
              <th className="table-header px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((task) => (
              <tr key={task.id} className="hover:bg-white/5">
                <td className="px-4 py-4">
                  <p className="font-semibold text-white/90">{task.title}</p>
                  <p className="text-xs text-white/50">{task.description}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {task.tags.map((tagName) => (
                      <span key={tagName} className="rounded-full bg-white/10 px-3 py-1">
                        #{tagName}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">{'★'.repeat(task.difficulty)}</td>
                <td className="px-4 py-4">
                  <Badge
                    variant={
                      task.status === 'done'
                        ? 'done'
                        : task.status === 'in_progress'
                        ? 'progress'
                        : task.status === 'milestone'
                        ? 'milestone'
                        : 'pending'
                    }
                  >
                    {statusLabel[task.status]}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-right">
                  {task.status !== 'done' ? (
                    <Button
                      variant="secondary"
                      onClick={() => completeTask(task.id)}
                      aria-label={`${task.title}を完了`}
                    >
                      完了
                    </Button>
                  ) : (
                    <span className="text-xs text-success">完了済み</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="新規タスク"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={!form.title}>
              追加
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block text-xs text-white/60">
            タイトル
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="focus-ring mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
              aria-label="タスクタイトル"
            />
          </label>
          <label className="block text-xs text-white/60">
            詳細
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="focus-ring mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
              rows={3}
              aria-label="タスク詳細"
            />
          </label>
          <label className="block text-xs text-white/60">
            難易度
            <input
              type="range"
              min={1}
              max={5}
              value={form.difficulty}
              onChange={(event) => setForm((prev) => ({ ...prev, difficulty: Number(event.target.value) }))}
              className="mt-2 w-full"
              aria-label="難易度"
            />
          </label>
          <div>
            <p className="text-xs text-white/60">タグ</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {tags.filter((tagValue) => tagValue !== 'all').map((tagValue) => (
                <button
                  key={tagValue}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      tags: prev.tags.includes(tagValue)
                        ? prev.tags.filter((t) => t !== tagValue)
                        : [...prev.tags, tagValue]
                    }))
                  }
                  className={`focus-ring rounded-full px-3 py-1 ${
                    form.tags.includes(tagValue) ? 'bg-accent text-[#0B1020]' : 'bg-white/10 text-white/60'
                  }`}
                  aria-label={`${tagValue}タグを切替`}
                >
                  #{tagValue}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
