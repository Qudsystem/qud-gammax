import { describe, it, expect, beforeEach } from 'vitest';
import { DiagramEditor } from '../editor';
import fc from 'fast-check';

describe('Diagram Editor', () => {
  let editor: DiagramEditor;

  beforeEach(() => {
    editor = new DiagramEditor();
  });

  // Unit Tests
  describe('Unit Tests for Diagram Components', () => {
    it('should create diagram nodes', () => {
      const node = editor.createNode({
        id: 'node-1',
        shape: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50
      });

      expect(node).toBeDefined();
      expect(node.id).toBe('node-1');
      expect(node.shape).toBe('rectangle');
    });

    it('should support 8+ shapes', () => {
      const shapes = [
        'rectangle',
        'circle',
        'triangle',
        'diamond',
        'hexagon',
        'parallelogram',
        'star',
        'ellipse'
      ];

      shapes.forEach(shape => {
        const node = editor.createNode({
          id: `node-${shape}`,
          shape,
          x: 100,
          y: 100,
          width: 100,
          height: 50
        });

        expect(node.shape).toBe(shape);
      });
    });

    it('should create connections between nodes', () => {
      const node1 = editor.createNode({
        id: 'node-1',
        shape: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 50
      });

      const node2 = editor.createNode({
        id: 'node-2',
        shape: 'rectangle',
        x: 200,
        y: 0,
        width: 100,
        height: 50
      });

      const connection = editor.createConnection({
        id: 'conn-1',
        fromNodeId: 'node-1',
        toNodeId: 'node-2',
        style: 'solid'
      });

      expect(connection).toBeDefined();
      expect(connection.fromNodeId).toBe('node-1');
    });

    it('should handle drag-and-drop positioning', () => {
      const node = editor.createNode({
        id: 'node-1',
        shape: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50
      });

      editor.addNode(node);
      editor.moveNode('node-1', { x: 200, y: 150 });

      const moved = editor.getNode('node-1');
      expect(moved.x).toBe(200);
      expect(moved.y).toBe(150);
    });

    it('should support node resizing', () => {
      const node = editor.createNode({
        id: 'node-1',
        shape: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50
      });

      editor.addNode(node);
      editor.resizeNode('node-1', { width: 200, height: 100 });

      const resized = editor.getNode('node-1');
      expect(resized.width).toBe(200);
      expect(resized.height).toBe(100);
    });
  });

  // Property-based Tests
  describe('Property-based Tests for Diagram Serialization', () => {
    it('should preserve diagram data through serialization', () => {
      fc.assert(
        fc.property(
          fc.record({
            nodeCount: fc.integer({ min: 1, max: 20 }),
            nodes: fc.array(
              fc.record({
                shape: fc.constantFrom('rectangle', 'circle', 'diamond'),
                x: fc.nat(1000),
                y: fc.nat(1000),
                width: fc.nat({ max: 500 }),
                height: fc.nat({ max: 500 })
              }),
              { minLength: 1, maxLength: 20 }
            )
          }),
          (props) => {
            props.nodes.forEach((n, i) => {
              const node = editor.createNode({
                id: `node-${i}`,
                shape: n.shape,
                x: n.x,
                y: n.y,
                width: n.width || 100,
                height: n.height || 50
              });

              editor.addNode(node);
            });

            const serialized = editor.serialize();
            const deserialized = editor.deserialize(serialized);

            expect(deserialized.nodes.length).toBe(props.nodes.length);
            deserialized.nodes.forEach((n, i) => {
              expect(n.shape).toBe(props.nodes[i].shape);
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Connection Auto-Update Tests
  describe('Property-based Tests for Connection Auto-Update', () => {
    it('should maintain connection paths when nodes move', () => {
      fc.assert(
        fc.property(
          fc.record({
            moves: fc.array(
              fc.record({
                nodeId: fc.constantFrom('node-1', 'node-2'),
                newX: fc.nat(1000),
                newY: fc.nat(1000)
              }),
              { maxLength: 10 }
            )
          }),
          (props) => {
            const n1 = editor.createNode({
              id: 'node-1',
              shape: 'rectangle',
              x: 0,
              y: 0,
              width: 100,
              height: 50
            });

            const n2 = editor.createNode({
              id: 'node-2',
              shape: 'rectangle',
              x: 200,
              y: 0,
              width: 100,
              height: 50
            });

            editor.addNode(n1);
            editor.addNode(n2);

            const conn = editor.createConnection({
              id: 'conn-1',
              fromNodeId: 'node-1',
              toNodeId: 'node-2'
            });

            editor.addConnection(conn);

            props.moves.forEach(move => {
              editor.moveNode(move.nodeId, { x: move.newX, y: move.newY });
            });

            const updatedConn = editor.getConnection('conn-1');
            expect(updatedConn).toBeDefined();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Integration Tests
  describe('Integration Tests for Complete Diagram Workflow', () => {
    it('should handle complete diagram workflow', () => {
      // Create nodes
      const nodes = [
        { id: 'n1', shape: 'rectangle', x: 50, y: 50 },
        { id: 'n2', shape: 'circle', x: 250, y: 50 },
        { id: 'n3', shape: 'diamond', x: 150, y: 200 }
      ];

      nodes.forEach(n => {
        const node = editor.createNode({
          id: n.id,
          shape: n.shape,
          x: n.x,
          y: n.y,
          width: 100,
          height: 50
        });
        editor.addNode(node);
      });

      // Create connections
      const conn1 = editor.createConnection({
        id: 'c1',
        fromNodeId: 'n1',
        toNodeId: 'n3'
      });

      const conn2 = editor.createConnection({
        id: 'c2',
        fromNodeId: 'n2',
        toNodeId: 'n3'
      });

      editor.addConnection(conn1);
      editor.addConnection(conn2);

      // Test undo/redo
      editor.moveNode('n1', { x: 100, y: 100 });
      expect(editor.getNode('n1').x).toBe(100);

      editor.undo();
      expect(editor.getNode('n1').x).toBe(50);

      editor.redo();
      expect(editor.getNode('n1').x).toBe(100);

      // Serialize and deserialize
      const serialized = editor.serialize();
      expect(serialized).toBeDefined();

      const newEditor = DiagramEditor.deserialize(serialized);
      expect(newEditor.getNodes().length).toBe(3);
      expect(newEditor.getConnections().length).toBe(2);
    });

    it('should support node grouping', () => {
      const nodes = [
        editor.createNode({ id: 'n1', shape: 'rectangle', x: 50, y: 50 }),
        editor.createNode({ id: 'n2', shape: 'rectangle', x: 150, y: 50 })
      ];

      nodes.forEach(n => editor.addNode(n));

      const group = editor.groupNodes(['n1', 'n2']);
      expect(group).toBeDefined();

      editor.moveNode(group.id, { x: 200, y: 200 });

      const n1 = editor.getNode('n1');
      const n2 = editor.getNode('n2');

      expect(n1.x).toBeGreaterThan(50);
      expect(n2.x).toBeGreaterThan(150);
    });

    it('should support alignment guides', () => {
      const nodes = [
        editor.createNode({ id: 'n1', shape: 'rectangle', x: 50, y: 50 }),
        editor.createNode({ id: 'n2', shape: 'rectangle', x: 150, y: 80 })
      ];

      nodes.forEach(n => editor.addNode(n));

      const guides = editor.getAlignmentGuides('n1', 'n2');
      expect(guides).toBeDefined();
      expect(guides.length).toBeGreaterThan(0);
    });
  });
});
