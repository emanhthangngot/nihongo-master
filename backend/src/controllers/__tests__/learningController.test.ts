import { describe, it, expect, vi } from 'vitest';
import { getRecommendedNodes } from '../learningController';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Learning Controller - getRecommendedNodes', () => {
  it('should recommend nodes where all prerequisites are completed', async () => {
    const mockNodes = [
      { id: 'node1' },
      { id: 'node2' },
      { id: 'node3' },
      { id: 'node4' }, // no prerequisites
    ];
    
    const mockEdges = [
      { from_node: 'node1', to_node: 'node2' },
      { from_node: 'node2', to_node: 'node3' },
    ];

    const mockProgress = [
      { node_id: 'node1', status: 'completed' },
    ];

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === 'learning_graph_nodes') {
        return { select: vi.fn().mockResolvedValue({ data: mockNodes, error: null }) };
      }
      if (table === 'learning_graph_edges') {
        return { select: vi.fn().mockResolvedValue({ data: mockEdges, error: null }) };
      }
      if (table === 'user_node_progress') {
        return { 
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: mockProgress, error: null })
        };
      }
    });

    supabase.from = fromMock as any;

    const req = { userId: 'user-123' } as any;
    const res = {
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    await getRecommendedNodes(req, res, next);

    // node1 is completed.
    // node2 requires node1 (completed).
    // node3 requires node2 (NOT completed).
    // node4 has no prerequisites (completed trivially).
    // Pending nodes: node2, node3, node4.
    // Recommended: node2, node4.

    expect(res.json).toHaveBeenCalledWith([{ id: 'node2' }, { id: 'node4' }]);
  });
});
