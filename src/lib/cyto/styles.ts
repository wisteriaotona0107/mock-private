import { Stylesheet } from 'cytoscape';

export const getStyles = (): Stylesheet[] => [
  {
    selector: 'node',
    style: {
      width: '60px',
      height: '60px',
      'background-color': '#5A5F73',
      'border-width': 2,
      'border-color': '#0B1020',
      label: 'data(label)',
      color: '#E6EDF8',
      'font-size': '12px',
      'text-wrap': 'wrap',
      'text-max-width': '80px',
      'text-valign': 'center',
      'text-halign': 'center',
      'transition-property': 'background-color, box-shadow, border-color',
      'transition-duration': '300ms'
    }
  },
  {
    selector: 'node[status = "in_progress"]',
    style: {
      'background-color': '#3DB2FF',
      'box-shadow': '0 0 20px #3DB2FF'
    }
  },
  {
    selector: 'node[status = "done"]',
    style: {
      'background-color': '#2ECC71',
      'box-shadow': '0 0 20px #2ECC71'
    }
  },
  {
    selector: 'node[status = "milestone"]',
    style: {
      'background-color': '#F1C40F',
      'box-shadow': '0 0 25px #F1C40F',
      width: '72px',
      height: '72px',
      'font-size': '14px'
    }
  },
  {
    selector: 'edge',
    style: {
      width: 3,
      'line-color': 'rgba(61,178,255,0.4)',
      'target-arrow-color': 'rgba(61,178,255,0.7)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier'
    }
  },
  {
    selector: ':selected',
    style: {
      'border-width': 4,
      'border-color': '#F1C40F'
    }
  }
];
