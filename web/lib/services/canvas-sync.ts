const DEBOUNCE_MS = 300;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

type PendingPositionUpdate = {
  nodeId: string;
  x: number;
  y: number;
  timeoutId: NodeJS.Timeout;
};

const pendingPositionUpdates = new Map<string, PendingPositionUpdate>();

function getApiBase(projectId: string): string {
  return `/api/projects/${projectId}`;
}

export async function syncNodePosition(
  projectId: string,
  nodeId: string,
  x: number,
  y: number
): Promise<void> {
  const key = `${projectId}:${nodeId}`;
  const existing = pendingPositionUpdates.get(key);

  if (existing) {
    clearTimeout(existing.timeoutId);
  }

  const timeoutId = setTimeout(async () => {
    pendingPositionUpdates.delete(key);
    try {
      await fetch(`${getApiBase(projectId)}/nodes/${nodeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionX: x, positionY: y }),
      });
    } catch (error) {
      console.error('Failed to sync node position:', error);
    }
  }, DEBOUNCE_MS);

  pendingPositionUpdates.set(key, { nodeId, x, y, timeoutId });
}

export async function syncNodeData(
  projectId: string,
  nodeId: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await fetch(`${getApiBase(projectId)}/nodes/${nodeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
  } catch (error) {
    console.error('Failed to sync node data:', error);
  }
}

export async function createNodeInDb(
  projectId: string,
  node: {
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await fetch(`${getApiBase(projectId)}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: node.id,
        type: node.type,
        label: node.label,
        position: node.position,
        data: node.data,
      }),
    });
  } catch (error) {
    console.error('Failed to create node in DB:', error);
  }
}

export async function deleteNodeFromDb(
  projectId: string,
  nodeId: string
): Promise<void> {
  try {
    await fetch(`${getApiBase(projectId)}/nodes/${nodeId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete node from DB:', error);
  }
}

export async function createEdgeInDb(
  projectId: string,
  edge: {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
  }
): Promise<void> {
  try {
    await fetch(`${getApiBase(projectId)}/edges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edge),
    });
  } catch (error) {
    console.error('Failed to create edge in DB:', error);
  }
}

export async function deleteEdgeFromDb(
  projectId: string,
  edgeId: string
): Promise<void> {
  try {
    await fetch(`${getApiBase(projectId)}/edges/${edgeId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete edge from DB:', error);
  }
}

export interface DbNode {
  id: string;
  projectId: string;
  type: string;
  label: string;
  positionX: number;
  positionY: number;
  data: Record<string, unknown>;
}

export interface DbEdge {
  id: string;
  projectId: string;
  source: string;
  target: string;
  animated: boolean;
}

export async function loadProjectFromDb(projectId: string): Promise<{
  nodes: DbNode[];
  edges: DbEdge[];
} | null> {
  try {
    const [nodesRes, edgesRes] = await Promise.all([
      fetch(`${getApiBase(projectId)}/nodes`),
      fetch(`${getApiBase(projectId)}/edges`),
    ]);

    if (!nodesRes.ok || !edgesRes.ok) {
      return null;
    }

    const nodes = await nodesRes.json();
    const edges = await edgesRes.json();

    return { nodes, edges };
  } catch (error) {
    console.error('Failed to load project from DB:', error);
    return null;
  }
}

export async function updateProjectStatus(
  projectId: string,
  status: string,
  additionalData?: Record<string, unknown>
): Promise<void> {
  try {
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...additionalData }),
    });
  } catch (error) {
    console.error('Failed to update project status:', error);
  }
}

export function flushPendingUpdates(): void {
  for (const [key, pending] of pendingPositionUpdates.entries()) {
    clearTimeout(pending.timeoutId);
    pendingPositionUpdates.delete(key);
  }
}

export interface ProjectData {
  id: string;
  name: string;
  entityName: string;
  entityType: string;
  country?: string;
  status?: string;
}

export async function createProjectInDb(project: ProjectData): Promise<boolean> {
  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to create project in DB:', error);
    return false;
  }
}

export async function fetchProjectsFromDb(): Promise<ProjectData[]> {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}
