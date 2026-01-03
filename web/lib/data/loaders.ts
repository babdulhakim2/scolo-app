import { requireDb, projects, nodes, edges } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import type { ProjectStatus } from '@/app/types/canvas';

export interface LoadedProject {
  id: string;
  name: string;
  entityCount: number;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
}

export interface LoadedNode {
  id: string;
  type: string;
  label: string;
  positionX: number;
  positionY: number;
  data: Record<string, unknown>;
}

export interface LoadedEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
}

export interface InitialCanvasData {
  projects: LoadedProject[];
  user: { id: string; email: string } | null;
  currentProject?: {
    id: string;
    nodes: LoadedNode[];
    edges: LoadedEdge[];
  };
}

export async function loadProjectsForUser(userId: string): Promise<LoadedProject[]> {
  const db = requireDb();

  const dbProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));

  return dbProjects.map((p) => ({
    id: p.id,
    name: p.name,
    entityCount: 0,
    status: (p.status as ProjectStatus) || 'pending',
    createdAt: p.createdAt.getTime(),
    updatedAt: p.updatedAt.getTime(),
  }));
}

export async function loadProjectData(
  projectId: string,
  userId: string
): Promise<{ nodes: LoadedNode[]; edges: LoadedEdge[] } | null> {
  const db = requireDb();

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

  if (!project) {
    return null;
  }

  const [projectNodes, projectEdges] = await Promise.all([
    db.select().from(nodes).where(eq(nodes.projectId, projectId)),
    db.select().from(edges).where(eq(edges.projectId, projectId)),
  ]);

  return {
    nodes: projectNodes.map((n) => ({
      id: n.id,
      type: n.type,
      label: n.label,
      positionX: n.positionX,
      positionY: n.positionY,
      data: n.data as Record<string, unknown>,
    })),
    edges: projectEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: e.animated ?? true,
    })),
  };
}

export async function loadInitialCanvasData(
  userId: string,
  userEmail: string,
  projectId?: string
): Promise<InitialCanvasData> {
  const projectsList = await loadProjectsForUser(userId);

  const data: InitialCanvasData = {
    projects: projectsList,
    user: { id: userId, email: userEmail },
  };

  if (projectId) {
    const projectData = await loadProjectData(projectId, userId);
    if (projectData) {
      data.currentProject = {
        id: projectId,
        nodes: projectData.nodes,
        edges: projectData.edges,
      };
    }
  }

  return data;
}
