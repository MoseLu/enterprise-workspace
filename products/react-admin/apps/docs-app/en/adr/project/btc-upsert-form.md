---
title: BtcUpsert vs BtcForm Responsibility Clarification - Aligned with cool-admin
type: adr
project: project
owner: dev-team
created: '2025-10-12'
updated: '2025-10-13'
publish: true
tags:
- adr
- project
- components
- clarification
sidebar_label: BtcUpsert Responsibility
sidebar_order: 2
sidebar_group: adr-project
---

# ADR: BtcUpsert vs BtcForm Responsibility Clarification

> **Status**: Accepted  
> **Date**: 2025-10-12  
> **Decision Maker**: Development Team  
> **Impact Scope**: Component library design and CRUD system  

---

## Context

In initial implementation, we mistakenly thought BtcForm should replace BtcUpsert, leading to migrating all CRUD pages to BtcForm. However, through in-depth study of cool-admin's design, we found:
1. **cool-admin's main usage is `cl-upsert`** (declarative, in CRUD context)
2. **`cl-form` is an independent component** (imperative, for non-CRUD scenarios)
3. **Both have completely different purposes**, not a replacement relationship

This led to architectural understanding deviation that needs correction.

## Options

### Option A: Delete BtcForm, only keep BtcUpsert

**Pros**:
- Simplify component system
- Reduce maintenance burden
- Avoid choice confusion

**Cons**:
- Lose ability to handle independent forms
- BtcUpsert must be used within BtcCrud, limiting flexibility
- Inconsistent with cool-admin design

### Option B: Keep both, clarify purposes

**Pros**:
- Aligns with cool-admin design philosophy
- Each has its role: BtcUpsert for CRUD, BtcForm for independent forms
- Already implemented BtcForm can be used for future independent form scenarios
- Provides complete solution

**Cons**:
- Need to maintain two components
- Need clear documentation explaining purposes
- Developers need to understand when to use which

### Option C: BtcUpsert inherits BtcForm

**Pros**:
- Code reuse
- Unified underlying implementation

**Cons**:
- Increased complexity
- Both APIs have fundamental differences (declarative vs imperative)
- Over-engineering

## Decision

**Choose Option B**: Keep both, clearly clarify purposes

Core reasons:

1. **Align with best practices**: cool-admin is also designed this way (cl-upsert + cl-form)
2. **Clear responsibilities**:
   - BtcUpsert: CRUD-specific (99% of scenarios)
   - BtcForm: General forms (1% of scenarios)
3. **Future extensibility**: Retain ability to handle complex independent forms
4. **Follows single responsibility principle**: Each component does one thing well

### Implementation Strategy

1. **Restore all CRUD pages to use BtcUpsert** (10 permission management pages)
2. **Enhance BtcUpsert**:
   - Add mode property (add/update/info)
   - Add complete lifecycle hooks
   - Support dynamic form items
   - Integrate form-hook
3. **Keep BtcForm** for future independent form scenarios
4. **Create detailed documentation**: Clearly explain usage differences between the two

## Consequences

### Positive

- Clear architecture: CRUD uses BtcUpsert, independent forms use BtcForm
- Aligns with cool-admin: Lower learning curve
- Separation of concerns: Each component focuses on its own scenario
- Clean code: CRUD pages using declarative configuration is simpler
- Future extensible: Retain ability to handle complex forms

### Negative

- Dual component maintenance: Need to maintain two form components
- Learning cost: Developers need to understand when to use which
- Documentation burden: Need clear explanation of differences

### Risk Mitigation

1. **Detailed documentation**: Create `BTC-UPSERT-VS-FORM-GUIDE.md` with clear explanation
2. **Clear examples**: 10 permission management pages as BtcUpsert examples
3. **Priority guidance**: Documentation clearly states "99% of cases use BtcUpsert"
4. **Clear naming**: Upsert implies CRUD, Form implies general

## Implementation Results

### Completed (2025-10-12)

1. Restored 10 permission management pages to use BtcUpsert
2. Enhanced BtcUpsert:
   - mode property (add/update/info)
   - 6 lifecycle hooks (onOpen, onInfo, onOpened, onSubmit, onClose, onClosed)
   - Dynamic form item support (function return)
   - form-hook integration (simplified version)
3. Improved BtcForm:
   - Component mapping table (supports all Element Plus components)
   - Complete render function implementation
4. Created complete documentation:
   - `BTC-UPSERT-VS-FORM-GUIDE.md` - Comparison guide
   - `packages/shared-components/src/crud/upsert/README.md` - BtcUpsert documentation
   - `packages/shared-components/src/common/form/README.md` - BtcForm documentation

### Component Comparison

```
BtcUpsert (CRUD-specific) ← cl-upsert
- Declarative
- Used within <BtcCrud>
- 99% of scenarios

BtcForm (General forms) ← cl-form
- Imperative
- Used independently
- 1% of scenarios
```

## Follow-up Actions

- [ ] Add 'info' button support for BtcTable (detail mode)
- [ ] Add plugin system for BtcUpsert (reference cl-upsert)
- [ ] Add grouping/Tabs support for BtcUpsert
- [ ] Improve form-hook system (complete converters)
- [ ] Create video tutorial explaining differences

## References

- `docs/BTC-UPSERT-VS-FORM-GUIDE.md` - Usage guide
- `cool-admin-vue-8.x/packages/crud/src/components/upsert/` - Reference implementation
- `cool-admin-vue-8.x/packages/crud/src/components/form/` - Reference implementation
- `apps/admin-app/src/pages/system/` - Actual usage examples (10 pages)
