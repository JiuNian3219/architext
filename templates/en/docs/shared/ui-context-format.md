**ui_context.md Content Structure**:

```
# UI Context
> Platform: [type] | Generated: YYYY-MM-DD

## Screen Inventory
| ID | Name | Route | File | States |
|:---|:---|:---|:---|:---|
| S-01 | [name] | [route] | screens/S-01.html | default, loading, empty, error |

## Navigation Graph
S-XX → (trigger) → S-YY

## Screen Structure Summary
### S-XX · [Screen name]
**Layout**: [description]
**File**: screens/S-XX.html
**States**: default | loading | empty | error
**Key regions**: [data-el extraction]
```

- **At initialization** (`/archi.start`): Fill only "Screen Inventory" and "Navigation Graph"
- **After generation** (`/archi.ui`): Fill "Screen Structure Summary"