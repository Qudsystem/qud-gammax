import { DiagramNode, DiagramEdge, DiagramData, DiagramType } from '@/lib/types';
import { generateId } from '@/lib/utils';

export function createNode(
  label: string, 
  position: { x: number; y: number }, 
  type: DiagramNode['type'] = 'process'
): DiagramNode {
  return {
    id: generateId(),
    label,
    position,
    type,
    size: 'md'
  };
}

export function createEdge(
  from: string, 
  to: string, 
  label?: string
): DiagramEdge {
  return {
    id: generateId(),
    from,
    to,
    label,
    type: 'solid'
  };
}

export function validateDiagram(data: DiagramData): boolean {
  if (!data.nodes || !Array.isArray(data.nodes)) return false;
  
  // Check for dangling edges
  if (data.edges) {
    const nodeIds = new Set(data.nodes.map(n => n.id));
    for (const edge of data.edges) {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        return false;
      }
    }
  }
  
  return true;
}

export function getConnectedNodes(nodeId: string, data: DiagramData): string[] {
  if (!data.edges) return [];
  
  const connected = new Set<string>();
  data.edges.forEach(edge => {
    if (edge.from === nodeId) connected.add(edge.to);
    if (edge.to === nodeId) connected.add(edge.from);
  });
  
  return Array.from(connected);
}
