---
title: Adopt Documentation Pyramid System to Constrain Documentation Growth
type: adr
project: system
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- adr
- system
- documentation
sidebar_label: Documentation Pyramid System
sidebar_order: 2
sidebar_group: adr-system
---

# ADR: Adopt Documentation Pyramid System

> **Status**: Accepted  
> **Date**: 2025-10-11  
> **Decision Maker**: System Architect  
> **Impact Scope**: Documentation system and development process  

---

## Context
Project documentation explosion: ~30 MD files in root directory, types mixed (guide, tutorial, summary, troubleshooting, analysis, etc.)

Problems:
- Document types unclear, difficult to classify
- New documents created arbitrarily, lack constraints
- Document quality inconsistent
- High maintenance cost, difficult to find

Constraints:
- Need clear document classification system
- Need to constrain document creation behavior
- Need to ensure document quality
- Need to reduce maintenance costs

## Options
- **Option A**: Free document mode
- Pros: High flexibility
- Cons: Documents chaotic, difficult to manage

- **Option B**: Strict classification system
- Pros: Clear structure, easy to manage
- Cons: May be too rigid

- **Option C**: Documentation pyramid system
- Pros: Clear hierarchy, explicit constraints, quality controllable
- Cons: Initial time investment needed to establish standards

## Decision
Adopt Option C: Documentation pyramid system

Core reasons:
- Clear hierarchy: From overview to details, progressively deeper
- Explicit constraints: Each layer has clear goals and formats
- Quality controllable: Ensure quality through templates and checks

Pyramid structure:
```
Top layer: Overview documents (README, OVERVIEW)
├── Middle layer: Guide documents (GUIDE, TUTORIAL)
│   ├── Bottom layer: Reference documents (API, REFERENCE)
│   ├── Bottom layer: Troubleshooting (TROUBLESHOOTING)
│   └── Bottom layer: Analysis documents (ANALYSIS, SUMMARY)
```

Document type constraints:
- **Overview**: Overall project introduction, no more than 3
- **Guides**: Operation guides, 1 per topic
- **Reference**: API documentation, organized by module
- **Troubleshooting**: Common issues, organized by issue type
- **Analysis**: Technical analysis, organized by analysis topic

## Consequences
Positive Impact:
- Document structure clear, easy to navigate
- Document quality unified, maintenance costs reduced
- New document creation has clear standards
- Search efficiency improved

Negative Impact/Notes:
- Initial large amount of refactoring work needed
- Need team unified understanding and execution
- May need tool support (templates, checks, etc.)

Action Items:
- [x] Design documentation pyramid structure
- [x] Create document templates
- [x] Refactor existing documents
- [ ] Establish document checking mechanism
- [ ] Train team on using standards

---

**Status**: Implemented
**Last Review**: 2025-10-13
**Next Review**: 2025-11-13
