# Scolo Development Guide

## Adding a New Node/Agent Type

### 1. Database Schema (optional)

If your node needs new columns beyond the generic `data` jsonb field, update `lib/db/schema.ts`:

```ts
export const nodes = pgTable('nodes', {
  // ... existing columns
  // Add new columns here if needed
});
```

Then run migrations:
```bash
npm run db:generate
npm run db:push
```

### 2. Create Node Component

Create `app/components/nodes/YourNode.tsx`:

```tsx
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface YourNodeData {
  label: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  // Add your custom fields
  [key: string]: unknown;
}

export const YourNode = memo(({ id, data }: NodeProps) => {
  const nodeData = data as YourNodeData;

  return (
    <div className="bg-white border rounded-2xl shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-500" />

      <div className="font-semibold">{nodeData.label}</div>
      {/* Your node UI */}

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-500" />
    </div>
  );
});

YourNode.displayName = 'YourNode';
```

### 3. Register Node Type

In `app/components/canvas/ScoloCanvas.tsx`:

```tsx
import { YourNode } from '@/app/components/nodes/YourNode';

const nodeTypes = {
  entity: EntityNode,
  agent: AgentNode,
  summary: SummaryNode,
  your: YourNode, // Add here
};
```

### 4. Update Canvas Store (if needed)

In `app/store/canvas-store.ts`, add handling for new SSE events:

```ts
// Add tool pattern for detection
const TOOL_PATTERNS: Record<string, RegExp> = {
  // ... existing
  your_tool: /src\.tools\.your_tool|your_tool\.py/,
};

// In handleSSEMessage, add cases for new events
case 'your_event':
  // Handle your custom event
  break;
```

### 5. Create Backend Tool (if applicable)

Create `backend/src/tools/your_tool.py`:

```python
#!/usr/bin/env python3
"""Description of your tool."""

import json
import sys
from typing import Any

from . import weave_op, cuid

TOOL_ID = "your_tool"


@weave_op
def check(entity: str, **opts) -> dict[str, Any]:
    """Run your tool check."""
    result_id = cuid()

    # Your logic here

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": "clear",
        "confidence": 90,
        "findings": [],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.your_tool 'Entity'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
```

Register in `backend/src/tools/__init__.py`:

```python
from . import your_tool

TOOLS = {
    # ... existing
    "your_tool": your_tool.check,
}
```

### 6. Add to Project Routes (if applicable)

In `backend/src/api/routes/projects.py`:

```python
TOOL_CONFIG: dict[str, dict[str, str]] = {
    # ... existing
    "your_tool": {"name": "Your Tool", "icon": "icon-name"},
}
```

---

## Data Flow Overview

```
User Action
    ↓
Canvas Store (Zustand) ←→ React Flow
    ↓
canvas-sync.ts (API calls)
    ↓
/api/projects/[id]/nodes (Next.js API)
    ↓
Drizzle ORM
    ↓
Supabase PostgreSQL
```

### SSE Events Flow

```
Python Backend (claude_service.py)
    ↓
SSE Stream (/api/projects/[id]/stream)
    ↓
useProject hook (EventSource)
    ↓
canvas-store.handleSSEMessage()
    ↓
Node creation/updates
    ↓
canvas-sync.ts (persist to DB)
```

---

## ID Generation

All IDs use CUIDs for robustness:

**Frontend (Next.js):**
```ts
import { createId } from '@paralleldrive/cuid2';
const id = createId();
```

**Backend (Python):**
```python
from cuid2 import cuid_wrapper
cuid = cuid_wrapper()
id = cuid()
```

---

## File Structure

```
web/
├── app/
│   ├── components/
│   │   ├── canvas/        # Canvas components
│   │   ├── nodes/         # Node type components
│   │   ├── panels/        # Side panels
│   │   └── ui/            # Reusable UI components
│   ├── store/             # Zustand stores
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript types
├── lib/
│   ├── db/                # Drizzle schema & config
│   ├── services/          # Business logic (canvas-sync, etc.)
│   └── supabase/          # Supabase client setup
└── DEVELOPMENT.md

backend/
├── src/
│   ├── api/routes/        # FastAPI routes
│   ├── tools/             # Compliance tools
│   └── claude_service.py  # Agent orchestration
└── tests/
```
