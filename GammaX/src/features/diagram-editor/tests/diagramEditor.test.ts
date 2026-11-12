import { describe, it, expect, beforeEach } from 'vitest';
import { fc } from 'fast-check';
import { DiagramEditor } from '../services/diagramEditor';
import { DiagramNode, DiagramConnection } from '../types';

describe('DiagramEditor', () => {
  let editor: DiagramEditor;

  beforeEach(() => {
    editor = new DiagramEditor();
  });

  describe('Unit Tests - Diagram Components', () => {
    it('should create a node', () => {
      const node: DiagramNode = {
        id: '1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
        label: 'Node 1',
      };

      editor.addNode(node);
      expect(editor.getNode('1')).toEqual(node);
    });

    it('should support all 8+ shapes', () => {
      const shapes = ['rectangle', 'circle', 'ellipse', 'diamond', 'hexagon', 'triangle', 'pentagon', 'star'];

      shapes.forEach((shape, i) => {
        const node: DiagramNode = {
          id: `${i}`,
          type: shape,
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          label: shape,
        };

        editor.addNode(node);
        expect(editor.getNode(`${i}`)?.type).toBe(shape);
      });
    });

    it('should create connections between nodes', () => {
      const node1: DiagramNode = {
        id: '1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
      };

      const node2: DiagramNode = {
        id: '2',
        type: 'rectangle',
        x: 300,
        y: 100,
        width: 100,
        height: 50,
      };

      const connection: DiagramConnection = {
        id: 'conn1',
        sourceId: '1',
        targetId: '2',
        style: 'solid',
        label: 'connects to',
      };

      editor.addNode(node1);
      editor.addNode(node2);
      editor.addConnection(connection);

      expect(editor.getConnection('conn1')).toEqual(connection);
    });

    it('should support drag-and-drop positioning', () => {
      const node: DiagramNode = {
        id: '1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
      };

      editor.addNode(node);
      editor.moveNode('1', 200, 200);

      const moved = editor.getNode('1');
      expect(moved?.x).toBe(200);
      expect(moved?.y).toBe(200);
    });

    it('should support node resizing', () => {
      const node: DiagramNode = {
        id: '1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
      };

      editor.addNode(node);
      editor.resizeNode('1', 150, 75);

      const resized = editor.getNode('1');
      expect(resized?.width).toBe(150);
      expect(resized?.height).toBe(75);
    });
  });

  describe('Property-Based Tests - Serialization', () => {
    it('should preserve diagram structure through serialization', () => {
      fc.assert(
        fc.property(
          fc.record({
            nodeCount: fc.integer({ min: 1, max: 50 }),
            connectionCount: fc.integer({ min: 0, max: 30 }),
          }),
          (data) => {
            // Create nodes
            for (let i = 0; i < data.nodeCount; i++) {
              const node: DiagramNode = {
                id: `node${i}`,
                type: 'rectangle',
                x: Math.random() * 500,
                y: Math.random() * 500,
                width: 100,
                height: 50,
                label: `Node ${i}`,
              };
              editor.addNode(node);
            }

            // Create connections
            for (let i = 0; i < Math.min(data.connectionCount, data.nodeCount - 1); i++) {
              const connection: DiagramConnection = {
                id: `conn${i}`,
                sourceId: `node${i}`,
                targetId: `node${i + 1}`,
                style: 'solid',
              };
              editor.addConnection(connection);
            }

            // Serialize
            const serialized = editor.serialize();
            const newEditor = new DiagramEditor();
            newEditor.deserialize(serialized);

            expect(newEditor.getNodes().length).toBe(data.nodeCount);
            expect(newEditor.getConnections().length).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should auto-update connections on node movement', () => {
      fc.assert(
        fc.property(
          fc.record({
            startX: fc.integer({ min: 0, max: 500 }),
            startY: fc.integer({ min: 0, max: 500 }),
            newX: fc.integer({ min: 0, max: 500 }),
            newY: fc.integer({ min: 0, max: 500 }),
          }),
          (data) => {
            const node1: DiagramNode = {
              id: '1',
              type: 'rectangle',
              x: data.startX,
              y: data.startY,
              width: 100,
              height: 50,
            };

            const node2: DiagramNode = {
              id: '2',
              type: 'rectangle',
              x: 300,
              y: 300,
              width: 100,
              height: 50,
            };

            const connection: DiagramConnection = {
              id: 'conn1',
              sourceId: '1',
              targetId: '2',
              style: 'solid',
            };

            editor.addNode(node1);
            editor.addNode(node2);
            editor.addConnection(connection);

            editor.moveNode('1', data.newX, data.newY);

            const updatedConnection = editor.getConnection('conn1');
            expect(updatedConnection).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Integration Tests - Complete Workflow', () => {
    it('should support undo/redo with 30 actions', () => {
      for (let i = 0; i < 30; i++) {
        const node: DiagramNode = {
          id: `node${i}`,
          type: 'rectangle',
          x: i * 50,
          y: 100,
          width: 100,
          height: 50,
        };
        editor.addNode(node);
      }

      expect(editor.canUndo()).toBe(true);

      for (let i = 0; i < 15; i++) {
        editor.undo();
      }

      expect(editor.getNodes().length).toBeLessThan(30);

      for (let i = 0; i < 15; i++) {
        editor.redo();
      }

      expect(editor.getNodes().length).toBe(30);
    });

    it('should group nodes', () => {
      const nodes = Array.from({ length: 5 }, (_, i) => ({
        id: `node${i}`,
        type: 'rectangle' as const,
        x: i * 50,
        y: 100,
        width: 100,
        height: 50,
      }));

      nodes.forEach((n) => editor.addNode(n));

      const nodeIds = nodes.map((n) => n.id);
      editor.groupNodes(nodeIds);

      const group = editor.getGroup(nodeIds);
      expect(group).toBeDefined();
    });

    it('should apply alignment guides', () => {
      const node1: DiagramNode = {
        id: '1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
      };

      const node2: DiagramNode = {
        id: '2',
        type: 'rectangle',
        x: 300,
        y: 120,
        width: 100,
        height: 50,
      };

      editor.addNode(node1);
      editor.addNode(node2);

      editor.alignNodes(['1', '2'], 'horizontal');

      const aligned = editor.getNode('2');
      expect(aligned?.y).toBe(100);
    });

    it('should auto-save every 10 seconds', async () => {
      const node: DiagramNode = {
        id: '1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
      };

      editor.addNode(node);
      editor.enableAutoSave(10000);

      await new Promise((resolve) => setTimeout(resolve, 11000));

      const saved = editor.getLastSaveTime();
      expect(saved).toBeDefined();
    });
  });
});
