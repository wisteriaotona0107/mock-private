import { useEffect, useMemo, useRef, useState } from 'react';
import type { Core } from 'cytoscape';
import { initCytoscape, updateCytoscape } from '../lib/cyto/initCytoscape';
import { useTasksStore } from '../stores/tasks';
import { useUIStore } from '../stores/ui';
import { Drawer } from '../components/Drawer';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { IconButton } from '../components/IconButton';
import { Map as MapIcon, Orbit, Sparkles } from 'lucide-react';
import { TaskStatus } from '../types';

const statusLabel: Record<TaskStatus, string> = {
  pending: '未着手',
  in_progress: '進行中',
  done: '完了',
  milestone: 'マイルストーン'
};

export const SkillTreePage = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);
  const tasks = useTasksStore((state) => state.tasks);
  const completeTask = useTasksStore((state) => state.completeTask);
  const layout = useUIStore((state) => state.treeLayout);
  const setLayout = useUIStore((state) => state.setTreeLayout);

  const [selected, setSelected] = useState<string | null>(null);
  const selectedTask = useMemo(() => tasks.find((task) => task.id === selected) ?? null, [tasks, selected]);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; label?: string }>({
    visible: false,
    x: 0,
    y: 0
  });
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; taskId?: string }>({
    visible: false,
    x: 0,
    y: 0
  });

  const elements = useMemo(() => {
    const nodes = tasks.map((task) => ({
      group: 'nodes',
      data: {
        id: task.id,
        label: task.title,
        status: task.status,
        difficulty: task.difficulty,
        tags: task.tags
      }
    }));

    const edges = tasks
      .flatMap((task) => task.dependsOn.map((dep) => ({
        group: 'edges',
        data: { id: `${dep}-${task.id}`, source: dep, target: task.id }
      })))
      .filter((edge) => tasks.some((task) => task.id === edge.data.source) && tasks.some((task) => task.id === edge.data.target));

    return { nodes, edges };
  }, [tasks]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    cyRef.current = initCytoscape(containerRef.current, elements, layout, {
      onNodeSelect: (data) => {
        setSelected(data.id);
      },
      onNodeHover: ({ visible, position, data }) => {
        setTooltip({ visible, x: position.x, y: position.y, label: data?.label });
      },
      onContextMenu: ({ position, data }) => {
        setContextMenu({ visible: true, x: position.x, y: position.y, taskId: data.id });
      }
    });

    return () => {
      cyRef.current?.destroy();
      cyRef.current = null;
    };
  }, [elements, layout]);

  useEffect(() => {
    if (cyRef.current) {
      updateCytoscape(cyRef.current, layout);
    }
  }, [layout]);

  useEffect(() => {
    const handler = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const handleComplete = (taskId: string) => {
    completeTask(taskId);
    const cy = cyRef.current;
    if (!cy) return;
    const node = cy.getElementById(taskId);
    node.animate({ style: { 'box-shadow': '0 0 40px #2ECC71' } }, { duration: 150 });
    setTimeout(() => {
      node.animate({ style: { 'box-shadow': '' } }, { duration: 150 });
    }, 200);
  };

  return (
    <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)]">
      <div className="relative h-[600px] rounded-3xl border border-white/10 bg-[#0B1020]/70">
        <div className="absolute left-4 top-4 z-20 flex gap-2">
          <IconButton
            onClick={() => setLayout('cola')}
            active={layout === 'cola'}
            aria-label="colaレイアウトに切替"
          >
            <MapIcon size={18} />
          </IconButton>
          <IconButton
            onClick={() => setLayout('concentric')}
            active={layout === 'concentric'}
            aria-label="同心円レイアウトに切替"
          >
            <Orbit size={18} />
          </IconButton>
        </div>
        <div ref={containerRef} className="h-full w-full" aria-label="スキルツリーグラフ" />
        {tooltip.visible && (
          <div
            className="pointer-events-none absolute z-30 rounded-xl border border-accent/40 bg-[#10152B]/90 px-3 py-2 text-xs shadow-neon"
            style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
          >
            {tooltip.label}
          </div>
        )}
        {contextMenu.visible && contextMenu.taskId && (
          <div
            className="absolute z-30 w-48 rounded-2xl border border-white/10 bg-[#10152B] p-3 text-xs text-white/70 shadow-neon"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            role="menu"
          >
            <button className="focus-ring w-full rounded-xl px-3 py-2 text-left hover:bg-accent/10" aria-label="依存追加">
              依存追加（仮）
            </button>
            <button className="focus-ring mt-2 w-full rounded-xl px-3 py-2 text-left hover:bg-accent/10" aria-label="マイルストーン化">
              マイルストーン化（仮）
            </button>
          </div>
        )}
      </div>
      <Drawer
        open={Boolean(selectedTask)}
        onClose={() => setSelected(null)}
        title={selectedTask?.title ?? '詳細'}
      >
        {selectedTask && (
          <div className="space-y-4 text-sm">
            <Badge
              variant={
                selectedTask.status === 'done'
                  ? 'done'
                  : selectedTask.status === 'in_progress'
                  ? 'progress'
                  : selectedTask.status === 'milestone'
                  ? 'milestone'
                  : 'pending'
              }
            >
              {statusLabel[selectedTask.status]}
            </Badge>
            <p>{selectedTask.description}</p>
            <p>難易度: {'★'.repeat(selectedTask.difficulty)}</p>
            <div>
              <p className="text-xs text-white/50">タグ</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {selectedTask.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-3 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-white/50">依存タスク</p>
              <ul className="mt-2 space-y-1">
                {selectedTask.dependsOn.length === 0 && <li className="text-white/40">なし</li>}
                {selectedTask.dependsOn.map((dep) => {
                  const task = tasks.find((t) => t.id === dep);
                  return <li key={dep}>{task?.title ?? dep}</li>;
                })}
              </ul>
            </div>
            {selectedTask.status !== 'done' && (
              <Button onClick={() => handleComplete(selectedTask.id)} aria-label="タスク完了">
                <Sparkles size={18} /> 完了する
              </Button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
