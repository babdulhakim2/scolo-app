import type { Node } from '@xyflow/react';

const NODE_WIDTH = 280;
const NODE_HEIGHT = 120;
const PADDING = 50;
const GRID_SIZE = 20;

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getNodeBounds(node: Node): BoundingBox {
  const width = (node.measured?.width ?? NODE_WIDTH) + PADDING;
  const height = (node.measured?.height ?? NODE_HEIGHT) + PADDING;
  return {
    x: node.position.x,
    y: node.position.y,
    width,
    height,
  };
}

function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function findNonCollidingPosition(
  nodes: Node[],
  targetPosition: { x: number; y: number },
  excludeNodeId?: string
): { x: number; y: number } {
  const otherNodes = excludeNodeId
    ? nodes.filter((n) => n.id !== excludeNodeId)
    : nodes;

  if (otherNodes.length === 0) {
    return { x: snapToGrid(targetPosition.x), y: snapToGrid(targetPosition.y) };
  }

  const testBounds: BoundingBox = {
    x: targetPosition.x,
    y: targetPosition.y,
    width: NODE_WIDTH + PADDING,
    height: NODE_HEIGHT + PADDING,
  };

  const hasCollision = otherNodes.some((node) =>
    boxesOverlap(testBounds, getNodeBounds(node))
  );

  if (!hasCollision) {
    return { x: snapToGrid(targetPosition.x), y: snapToGrid(targetPosition.y) };
  }

  const searchRadius = 1200;
  const step = NODE_WIDTH + PADDING;

  for (let distance = step; distance < searchRadius; distance += step) {
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    for (const angle of angles) {
      const testX = targetPosition.x + Math.cos(angle) * distance;
      const testY = targetPosition.y + Math.sin(angle) * distance;
      const testBox: BoundingBox = {
        x: testX,
        y: testY,
        width: NODE_WIDTH + PADDING,
        height: NODE_HEIGHT + PADDING,
      };

      const collides = otherNodes.some((node) =>
        boxesOverlap(testBox, getNodeBounds(node))
      );

      if (!collides) {
        return { x: snapToGrid(testX), y: snapToGrid(testY) };
      }
    }

    const diagonalAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    for (const angle of diagonalAngles) {
      const testX = targetPosition.x + Math.cos(angle) * distance;
      const testY = targetPosition.y + Math.sin(angle) * distance;
      const testBox: BoundingBox = {
        x: testX,
        y: testY,
        width: NODE_WIDTH + PADDING,
        height: NODE_HEIGHT + PADDING,
      };

      const collides = otherNodes.some((node) =>
        boxesOverlap(testBox, getNodeBounds(node))
      );

      if (!collides) {
        return { x: snapToGrid(testX), y: snapToGrid(testY) };
      }
    }
  }

  return {
    x: snapToGrid(targetPosition.x + searchRadius),
    y: snapToGrid(targetPosition.y),
  };
}

export function organizeHierarchical(nodes: Node[]): Node[] {
  if (nodes.length === 0) return nodes;

  const entityNodes = nodes.filter((n) => n.type === 'entity');
  const agentNodes = nodes.filter((n) => n.type === 'agent');
  const summaryNodes = nodes.filter((n) => n.type === 'summary');
  const otherNodes = nodes.filter(
    (n) => n.type !== 'entity' && n.type !== 'agent' && n.type !== 'summary'
  );

  const LEVEL_Y = { entity: 80, agent: 320, summary: 580, other: 820 };
  const HORIZONTAL_SPACING = 340;
  const CENTER_X = 500;

  const positioned: Node[] = [];

  entityNodes.forEach((node, idx) => {
    const totalWidth = (entityNodes.length - 1) * HORIZONTAL_SPACING;
    const startX = CENTER_X - totalWidth / 2;
    positioned.push({
      ...node,
      position: { x: snapToGrid(startX + idx * HORIZONTAL_SPACING), y: LEVEL_Y.entity },
    });
  });

  agentNodes.forEach((node, idx) => {
    const totalWidth = (agentNodes.length - 1) * HORIZONTAL_SPACING;
    const startX = CENTER_X - totalWidth / 2;
    positioned.push({
      ...node,
      position: { x: snapToGrid(startX + idx * HORIZONTAL_SPACING), y: LEVEL_Y.agent },
    });
  });

  summaryNodes.forEach((node, idx) => {
    const totalWidth = (summaryNodes.length - 1) * HORIZONTAL_SPACING;
    const startX = CENTER_X - totalWidth / 2;
    positioned.push({
      ...node,
      position: { x: snapToGrid(startX + idx * HORIZONTAL_SPACING), y: LEVEL_Y.summary },
    });
  });

  otherNodes.forEach((node, idx) => {
    const totalWidth = (otherNodes.length - 1) * HORIZONTAL_SPACING;
    const startX = CENTER_X - totalWidth / 2;
    positioned.push({
      ...node,
      position: { x: snapToGrid(startX + idx * HORIZONTAL_SPACING), y: LEVEL_Y.other },
    });
  });

  return resolveAllCollisions(positioned);
}

export function resolveAllCollisions(nodes: Node[]): Node[] {
  if (nodes.length <= 1) return nodes;

  const resolved: Node[] = [];

  for (const node of nodes) {
    const newPosition = findNonCollidingPosition(
      resolved,
      node.position,
      node.id
    );
    resolved.push({ ...node, position: newPosition });
  }

  return resolved;
}
