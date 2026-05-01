**ui_context.md Content Structure**:

```
# UI Context
> Platform: [Type] | Generated: YYYY-MM-DD

## Screen Index
| ID | Name | Route | File | Status |
|:---|:---|:---|:---|:---|
| S-01 | [Name] | [Route] | screens/S-01.html | default, loading, empty, error |

## Navigation Relationships
S-XX → (trigger condition) → S-YY

## Screen Structure Summary
### S-XX · [Screen Name]
**Layout**: [Description]
**File**: screens/S-XX.html
**Purpose**: Visual/interaction reference only; coding phase must not directly copy this HTML/CSS/JS, must re-implement using project's own tech stack.
**States**: default | loading | empty | error
**Key Regions**: [data-el extraction]
```

- **At initialization** (`/archi.start`): Only fill "Screen Index" and "Navigation Relationships"
- **After generation** (`/archi.ui`): Fill "Screen Structure Summary"