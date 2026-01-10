# Milestone 10: Reports

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-9 complete

---

## Goal

Implement the Reports section — analytics and operation history.

## Overview

The Reports section provides comprehensive analytics including revenue reports, utilization reports, customer insights, and operation history with advanced filtering.

**Key Functionality:**
- Revenue reports (daily/weekly/monthly)
- Session vs inventory revenue breakdown
- Resource utilization reports
- Peak hours analysis
- Operation history with filtering
- Export to CSV/PDF

## Components

| Component | Description |
|-----------|-------------|
| `ReportsPage` | Main reports layout with tabs |
| `RevenueReport` | Revenue analytics |
| `UtilizationReport` | Resource utilization |
| `OperationHistory` | Chronological log |

## Report Types

### Revenue Report
- Daily/weekly/monthly revenue
- Session revenue vs inventory revenue
- Top customers by revenue
- Revenue trends chart

### Utilization Report
- Most used resources
- Peak hours heatmap
- Average session duration
- Occupancy rate

### Operation History
- Chronological log of all actions
- Filter by type, date, customer, resource
- Search by keywords
- Export functionality

## Callbacks

| Callback | Description |
|----------|-------------|
| `onDateRangeChange` | Change report date range |
| `onExport` | Export report data |
| `onFilterChange` | Change history filters |

## Files to Reference

- `product-plan/sections/reports/` — All section files

## Done When

- [ ] Revenue report displays correctly
- [ ] Date range picker works
- [ ] Session vs inventory breakdown shows
- [ ] Utilization report displays
- [ ] Operation history with filtering works
- [ ] Export to CSV works
- [ ] Charts render correctly
