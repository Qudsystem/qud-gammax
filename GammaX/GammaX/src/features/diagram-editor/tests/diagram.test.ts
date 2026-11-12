import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createNode, createEdge, validateDiagram, getConnectedNodes } from '../utils';
import { DiagramData } from '@/lib/types';

describe('Diagram Editor Utils', () => {
  it('should create valid nodes', () => {
    const node = createNode('Test', { x: 10, y: 10 });
    expect(node.id).toBeDefined();
    expect(node.label).toBe('Test');
    expect(node.position).toEqual({ x: 10, y: 10 });
    expect(node.type).toBe('process');
  });

  it('should create valid edges', () => {
    const edge = createEdge('node1', 'node2', 'label');
    expect(edge.id).toBeDefined();
    expect(edge.from).toBe('node1');
    expect(edge.to).toBe('node2');
    expect(edge.label).toBe('label');
  });

  it('should validate valid diagram', () => {
    const n1 = createNode('N1', { x: 0, y: 0 });
    const n2 = createNode('N2', { x: 10, y: 10 });
    const edge = createEdge(n1.id, n2.id);

    const data: DiagramData = {
      type: 'flowchart',
      nodes: [n1, n2],
      edges: [edge]
    };

    expect(validateDiagram(data)).toBe(true);
  });

  it('should fail validation on dangling edges', () => {
    const n1 = createNode('N1', { x: 0, y: 0 });
    const edge = createEdge(n1.id, 'missing-node');

    const data: DiagramData = {
      type: 'flowchart',
      nodes: [n1],
      edges: [edge]
    };

    expect(validateDiagram(data)).toBe(false);
  });

  it('should get connected nodes correctly', () => {
    const n1 = createNode('N1', { x: 0, y: 0 });
    const n2 = createNode('N2', { x: 10, y: 10 });
    const n3 = createNode('N3', { x: 20, y: 20 });
    
    const e1 = createEdge(n1.id, n2.id);
    const e2 = createEdge(n2.id, n3.id);

    const data: DiagramData = {
      type: 'flowchart',
      nodes: [n1, n2, n3],
      edges: [e1, e2]
    };

    expect(getConnectedNodes(n2.id, data)).toEqual(expect.arrayContaining([n1.id, n3.id]));
  });

  describe('Property Tests', () => {
    const diagramArb = fc.record({
      nodes: fc.array(fc.record({
        id: fc.uuid(),
        label: fc.string(),
        position: fc.record({ x: fc.integer(), y: fc.integer() }),
        type: fc.constantFrom('start', 'end', 'process', 'decision')
      }), { minLength: 1 }),
      edges: fc.option(fc.array(fc.record({
        id: fc.uuid(),
        from: fc.uuid(),
        to: fc.uuid(),
        label: fc.option(fc.string())
      })))
    }).map(d => ({ ...d, type: 'flowchart' as const }));

    it('validateDiagram should always return boolean', () => {
      fc.assert(
        fc.property(diagramArb, (data) => {
          expect(typeof validateDiagram(data as any)).toBe('boolean');
        })
      );
    });

    it('getConnectedNodes should return subset of node IDs', () => {
      fc.assert(
        fc.property(diagramArb, (data: any) => {
          if (!data.nodes.length) return;
          const targetNodeId = data.nodes[0].id;
          const connected = getConnectedNodes(targetNodeId, data);
          
          // Check all returned IDs exist in edge definitions
          if (data.edges) {
            connected.forEach(id => {
              const linked = data.edges.some((e: any) => 
                (e.from === targetNodeId && e.to === id) || 
                (e.to === targetNodeId && e.from === id)
              );
              expect(linked).toBe(true);
            });
          } else {
            expect(connected).toHaveLength(0);
          }
        })
      );
    });
  });
});
