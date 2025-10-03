import { LayoutOptions } from 'cytoscape';

export const getLayoutOptions = (layout: 'cola' | 'concentric'): LayoutOptions => {
  if (layout === 'cola') {
    return {
      name: 'cola',
      animate: true,
      nodeSpacing: 20,
      edgeLength: 120,
      maxSimulationTime: 1000,
      padding: 40
    } as LayoutOptions;
  }

  return {
    name: 'concentric',
    animate: true,
    concentric: (node) => (node.data('status') === 'milestone' ? 3 : node.data('status') === 'done' ? 2 : 1),
    levelWidth: () => 1,
    padding: 50
  } as LayoutOptions;
};
