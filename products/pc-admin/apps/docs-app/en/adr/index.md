---
title: Architecture Decision Records
type: adr
project: btc-shopflow
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- adr
- architecture
sidebar_label: Architecture Decisions
sidebar_order: 1
sidebar_group: adr
---

# Architecture Decision Records (ADR)

> Architecture Decision Records

Architecture Decision Records (ADR) are documents that record important architectural decisions in the project, helping us understand why certain technical choices were made and the consequences of these choices.

## Purpose

- **Record Decision Process**: Record important architectural decisions and their context
- **Maintain Consistency**: Ensure team has unified understanding of architectural decisions
- **Facilitate Review**: Provide historical reference for future architectural evolution
- **Knowledge Transfer**: Help new team members quickly understand project architecture

## ADR Categories

### System Architecture
- **[Directory Structure Design](/en/adr/system/directory-layout)** - Directory-based layout architecture
- **[Documentation System Design](/en/adr/system/doc-pyramid)** - Documentation system pyramid structure
- **[Menu System Refactoring](/en/adr/system/menu-restructure)** - System menu structure optimization

### Technical Implementation
- **[SVG Plugin Fix](/en/adr/technical/svg-plugin-fix)** - SVG icon plugin issue fix
- **[Browser Title Internationalization](/en/adr/technical/browser-title-i18n)** - Browser title multilingual support
- **[BTC Dialog Component](/en/adr/technical/btc-dialog)** - Dialog component design decisions

### Project Management
- **[Remove Test Application](/en/adr/project/remove-test-app)** - Test application removal decision
- **[BTC Form Clarification](/en/adr/project/btc-upsert-form)** - BTC form component clarification

---

## ADR Template

Each ADR should include the following structure:

1. **Title**: Concise and clear decision description
2. **Status**: Proposed, Accepted, Rejected, Superseded
3. **Context**: Why this decision is needed
4. **Decision**: Specific architectural decision
5. **Consequences**: Positive and negative impacts of the decision

---

## Update Process

1. **Create ADR**: Create new ADR using standard template
2. **Team Review**: Team members review decision reasonableness
3. **Status Update**: Update ADR status based on review results
4. **Regular Review**: Regularly review accepted ADRs to ensure they remain applicable

---

## Best Practices

- **Keep It Concise**: ADRs should be concise and clear, avoid excessive detail
- **Record Timely**: Important decisions should be recorded promptly to avoid forgetting
- **Regular Maintenance**: Regularly review and update ADRs to ensure accuracy
- **Team Consensus**: Ensure team members have unified understanding of ADRs
