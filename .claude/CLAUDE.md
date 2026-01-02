# Scolo Code Standards

This guide defines the coding standards for the Scolo compliance platform.

## Core Principles

1. **Minimal code** - Write only what's needed. Delete unused code immediately.
2. **Meaningful names** - Names should explain intent without comments.
3. **Single responsibility** - Each function does one thing well.
4. **No magic values** - Extract constants with descriptive names.
5. **Fail fast** - Validate inputs early, handle errors explicitly.

## Python Standards

### File Structure

```python
"""Module docstring - one line explaining purpose."""

import stdlib_modules
import third_party_modules
from local_modules import specific_things

CONSTANTS_AT_TOP = "value"

def public_function():
    """Brief description."""
    pass

class ClassName:
    """Brief description."""
    pass
```

### Naming Conventions

```python
# Variables and functions: snake_case
user_count = 0
def calculate_risk_score():
    pass

# Classes: PascalCase
class ComplianceChecker:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRIES = 3
API_TIMEOUT = 30

# Private: prefix with underscore
def _internal_helper():
    pass
```

### Function Guidelines

```python
# Good: Single responsibility, clear name, type hints
def parse_tool_result(content: str) -> dict | None:
    """Extract JSON result from tool output."""
    try:
        match = re.search(r'\{[\s\S]*\}', content)
        if match:
            return json.loads(match.group())
    except (json.JSONDecodeError, AttributeError):
        pass
    return None

# Bad: Multiple responsibilities, vague name
def process(data):
    # Does too many things...
    pass
```

### Error Handling

```python
# Good: Specific exceptions, meaningful messages
try:
    response = await client.post(url, json=data)
    response.raise_for_status()
except httpx.HTTPStatusError as e:
    logger.error("API request failed: %s", e.response.status_code)
    raise
except httpx.RequestError as e:
    logger.error("Network error: %s", e)
    raise

# Bad: Bare except, silent failures
try:
    do_something()
except:
    pass
```

### Class Design

```python
class ClaudeService:
    """Service for running compliance investigations."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

    async def run_project(self, project_id: str, entity_name: str) -> AsyncGenerator[str, None]:
        """Run investigation with SSE streaming."""
        # Main entry point - orchestrates smaller methods
        yield self._format_event("start", project_id)
        async for event in self._stream_agent(project_id):
            yield event

    def _format_event(self, event_type: str, project_id: str) -> str:
        """Format SSE event. Private helper."""
        return f"data: {json.dumps({'type': event_type, 'id': project_id})}\n\n"
```

## TypeScript Standards

### File Structure

```typescript
import { external_deps } from 'package';
import { local_deps } from '@/lib/local';
import type { TypeOnly } from '@/types';

const CONSTANTS = { ... } as const;

interface ComponentProps { ... }

export function Component() { ... }

// Helper functions at bottom
function helperFunction() { ... }
```

### Naming Conventions

```typescript
// Variables and functions: camelCase
const userCount = 0;
function calculateRiskScore() {}

// Components and types: PascalCase
function EntityNode() {}
interface UserProfile {}
type RiskLevel = 'low' | 'medium' | 'high';

// Constants: UPPER_SNAKE_CASE in objects
const LAYOUT = {
  CENTER_X: 500,
  AGENT_Y: 260,
} as const;

// Boolean: prefix with is/has/should
const isProcessing = false;
const hasError = true;
const shouldFitView = false;
```

### React Component Guidelines

```typescript
// Good: Props interface, destructuring, early returns
interface EntityNodeProps {
  id: string;
  label: string;
  status: 'idle' | 'running' | 'completed';
  onDelete?: (id: string) => void;
}

export function EntityNode({ id, label, status, onDelete }: EntityNodeProps) {
  if (!label) return null;

  return (
    <div className="...">
      <span>{label}</span>
      {onDelete && <button onClick={() => onDelete(id)}>Delete</button>}
    </div>
  );
}

// Wrap with memo for nodes/expensive renders
export const EntityNode = memo(function EntityNode(props: EntityNodeProps) {
  // ...
});
```

### State Management (Zustand)

```typescript
// Separate state interface from actions
interface CanvasState {
  nodes: Node[];
  isProcessing: boolean;
}

interface CanvasActions {
  setNodes: (nodes: Node[]) => void;
  deleteNode: (id: string) => void;
}

// Extract handlers as separate functions for readability
function handleProjectStart(message: SSEMessage, set: SetState) {
  // ...
}

export const useCanvasStore = create<CanvasState & CanvasActions>()((set, get) => ({
  nodes: [],
  isProcessing: false,
  setNodes: (nodes) => set({ nodes }),
  handleSSEMessage: (message) => {
    switch (message.type) {
      case 'project_start':
        handleProjectStart(message, set);
        break;
    }
  },
}));
```

### API Route Guidelines

```typescript
// Good: Structured error handling, typed responses
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const db = requireDb();
    const { id } = await params;

    const [project] = await db.select().from(projects).where(eq(projects.id, id));

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Code Smells to Avoid

### Long Functions
Split into smaller functions when:
- More than 30 lines
- Multiple levels of nesting
- Multiple responsibilities

### Magic Numbers
```typescript
// Bad
const x = 500 + index * 280;

// Good
const LAYOUT = { CENTER_X: 500, AGENT_SPACING: 280 } as const;
const x = LAYOUT.CENTER_X + index * LAYOUT.AGENT_SPACING;
```

### Repeated Code
Extract into utilities:
```typescript
// Instead of repeating edge creation logic
function createDefaultEdge(source: string, target: string): Edge {
  return {
    id: `e${source}-${target}-${Date.now()}`,
    source,
    target,
    style: EDGE_STYLE,
  };
}
```

### Deep Nesting
Use early returns and extract functions:
```typescript
// Bad
if (a) {
  if (b) {
    if (c) {
      doSomething();
    }
  }
}

// Good
if (!a || !b || !c) return;
doSomething();
```

## Testing Guidelines

- Test behavior, not implementation
- One assertion per test when possible
- Use descriptive test names: `should_return_error_when_api_key_missing`
- Mock external services, not internal logic

## Git Commit Messages

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

Examples:
- `feat: add sanctions screening endpoint`
- `fix: handle empty API response in PEP check`
- `refactor: extract SSE message handlers`

## Build & Test

Always run these commands before committing:

```bash
# Frontend (Next.js)
cd web && npm run build && npm run lint

# Backend (Python)
cd backend && python -m pytest tests/ -v
```

IMPORTANT: Never commit code that fails the build. Run `npm run build` after making changes to catch type errors early.

## Review Checklist

Before committing:
- [ ] Build passes: `npm run build` (frontend) / `pytest` (backend)
- [ ] No unused imports or variables
- [ ] No console.log/print statements (use logger)
- [ ] No hardcoded secrets or API keys
- [ ] All functions have type hints (Python) or types (TypeScript)
- [ ] Error cases are handled
- [ ] Lint passes without warnings
