import { pgTable, text, timestamp, jsonb, integer, boolean, real } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  entityName: text('entity_name').notNull(),
  entityType: text('entity_type').notNull().default('company'),
  country: text('country'),
  status: text('status').notNull().default('pending'),
  riskLevel: text('risk_level'),
  totalFindings: integer('total_findings').default(0),
  toolsCompleted: integer('tools_completed').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const nodes = pgTable('nodes', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  label: text('label').notNull(),
  positionX: real('position_x').notNull().default(0),
  positionY: real('position_y').notNull().default(0),
  data: jsonb('data').notNull().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const edges = pgTable('edges', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  source: text('source').notNull(),
  target: text('target').notNull(),
  animated: boolean('animated').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const investigations = pgTable('investigations', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  toolKey: text('tool_key').notNull(),
  toolName: text('tool_name').notNull(),
  status: text('status').notNull(),
  resultType: text('result_type'),
  findings: jsonb('findings').default([]),
  confidence: integer('confidence'),
  error: text('error'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;
export type Edge = typeof edges.$inferSelect;
export type NewEdge = typeof edges.$inferInsert;
export type Investigation = typeof investigations.$inferSelect;
export type NewInvestigation = typeof investigations.$inferInsert;
