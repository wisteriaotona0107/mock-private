import cytoscape, { Core } from 'cytoscape';
import cola from 'cytoscape-cola';
import { getStyles } from './styles';
import { getLayoutOptions } from './layouts';

cytoscape.use(cola);

export interface TreeCallbacks {
  onNodeSelect?: (data: any) => void;
  onNodeHover?: (payload: { visible: boolean; position: { x: number; y: number }; data?: any }) => void;
  onContextMenu?: (payload: { position: { x: number; y: number }; data: any }) => void;
}

export const initCytoscape = (
  container: HTMLElement,
  elements: { nodes: any[]; edges: any[] },
  layout: 'cola' | 'concentric',
  callbacks?: TreeCallbacks
): Core => {
  const cy = cytoscape({
    container,
    elements: [...elements.nodes, ...elements.edges],
    style: getStyles(),
    layout: getLayoutOptions(layout),
    wheelSensitivity: 0.2,
    minZoom: 0.3,
    maxZoom: 2.5
  });

  if (callbacks?.onNodeSelect) {
    cy.on('tap', 'node', (event) => {
      callbacks.onNodeSelect?.(event.target.data());
    });
  }

  if (callbacks?.onNodeHover) {
    cy.on('mouseover', 'node', (event) => {
      callbacks.onNodeHover?.({ visible: true, position: event.renderedPosition, data: event.target.data() });
    });
    cy.on('mouseout', 'node', () => {
      callbacks.onNodeHover?.({ visible: false, position: { x: 0, y: 0 } });
    });
  }

  if (callbacks?.onContextMenu) {
    cy.on('cxttap', 'node', (event) => {
      callbacks.onContextMenu?.({ position: event.renderedPosition, data: event.target.data() });
    });
  }

  return cy;
};

export const updateCytoscape = (cy: Core, layout: 'cola' | 'concentric') => {
  cy.layout(getLayoutOptions(layout)).run();
};
