# Kard Projects View — Architectural & Implementation Plan

A comprehensive, production-grade Projects section for the Kard SaaS platform, seamlessly integrating with the sidebar navigation and dual-theme design system. It combines an interactive Bento Grid view with a High-Density Table view, advanced status/priority filtering, and a streamlined Project Creation & Details workflow.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions have been confirmed and synthesized based on user feedback:
> - **Dual Layout Toggle**: Toggle between **Bento Grid View** (spacious cards with visual progress, team stacks, and tags) and **High-Density Table View** (tabular data with sorting, velocity metrics, and inline actions).
> - **Unified Feature Mix**: A balanced blend of project creation modal, sprint milestones, team assignee management, and deliverable attachment counters without visual clutter.
> - **Multi-faceted Filtering**: Status tabs (*All*, *In Progress*, *Completed*, *On Hold*), search input by project name/client company, and priority chips (*High*, *Medium*, *Low*).

---

## 1. Overview & Core Concept

- **What It Does**: Provides developers, team leads, and project managers with a unified overview of all active and completed client projects (such as Google, Slack, Spotify, Linear, and Figma), tracking velocity, deliverables, assignees, and deadlines.
- **Target Persona**: Modern tech leads, software engineers, and digital product agencies needing quick status visibility without bureaucratic clutter.
- **Key Value**: Instant switching between an aesthetic visual grid and a metric-dense operational list, with real-time status transitions and synchronized dashboard updates.

---

## 2. User Experience & Visual Design

### A. Navigation & Placement
- Clicking **PROJECTS** in the Kard sidebar activates the Projects screen seamlessly while keeping the sidebar, top header, search, and theme switcher intact.
- Seamless route/tab switching within `app/page.tsx` or a dedicated view controller so project updates propagate across the dashboard without page reloads.

### B. Header & Control Bar
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Projects Overview (04 active)            [ Status: All | In Progress | Completed ]    │
│  [ Search projects or clients... ]  [ Priority: All ▾ ]  [ ⊞ Grid | ☰ Table ]  [ + New ]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```
- **Live Search**: Instant keyword filtering across project titles, client companies, and technology tags.
- **Segmented Status Tabs**: Clean active states using `--primary-subtle` and `--primary`.
- **Priority Filter Dropdown / Pill**: Filter by *High*, *Medium*, *Low* priority.
- **View Switcher**: Smooth button toggle between Grid layout and Dense Table layout.
- **"+ New Project" Action**: High-contrast button opening the project creation modal.

### C. View 1: Bento Grid Mode
- Expanded project cards building on the prototype's aesthetic:
  - Client branding logo (Google, Slack, custom SVG initials for new projects).
  - Star toggle for quick pinning.
  - Interactive progress indicator with tabular numbers and completion percentage.
  - Sprint deliverable pills (e.g. *Sprint 4 / 6*, *Wireframes*, *API Integration*).
  - Member avatars stack with `+X` overflow counter.
  - Due date pill in soft danger/warning colors (`--danger-subtle`).
  - Context menu for *Edit*, *Mark Completed*, *Duplicate*, and *Delete*.

### D. View 2: High-Density Table Mode
- Clean tabular view for fast scanning:
  - Columns: **Project & Client**, **Status Badge**, **Priority**, **Task Progress Bar & Ratio**, **Team Assignees**, **Due Date**, **Budget / Time Tracked**, and **Quick Actions**.
  - Row hover highlighting and sorting by due date or completion percentage.
  - Tabular numerals (`font-mono tabular-nums`) for all numbers and dates.

### E. Project Details & Creation Modal
- Form to add new projects with validation:
  - Project Title & Client Organization.
  - Brand Logo Selector (Google, Slack, Custom).
  - Priority Level (High, Medium, Low).
  - Initial Task Target & Sprint Scope.
  - Technology Tags (e.g., *IOS APP*, *UI/UX*, *REACT*, *BACKEND*).
  - Team Member Assignment (selecting from team directory).
  - Delivery Deadline date picker.

---

## 3. Key Product Decisions & Trade-Offs

- **View Toggle over Static Layout**:
  - *Chosen Approach*: Provide both Bento Grid and High-Density Table via a single segmented toggle.
  - *Why*: Accommodates both executive review (visual cards) and developer sprint triage (dense table rows).
- **Client-Side State Synchronization**:
  - *Chosen Approach*: Share project state across Dashboard and Projects view so that creating or completing a task in one view immediately updates the other.
- **Zero-Pill Discipline & Anti-Slop**:
  - *Chosen Approach*: Avoid candy badges and decorative pseudo-code tags; use quiet tabular text and semantic status colors.

---

## 4. Technical Architecture & Component Hierarchy

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                     DashboardPage                                     │
│  ┌───────────────────────┐  ┌──────────────────────────────────────────────────────┐  │
│  │        Sidebar        │  │                        Header                        │  │
│  │   [Dashboard]         │  │   [Search ⌘K]  [Theme Sun/Moon]  [Notifs]  [Profile] │  │
│  │ > [PROJECTS (active)] │  └──────────────────────────────────────────────────────┘  │
│  │   [My Tasks]          │                                                            │
│  │   [Calendar]          │  ┌──────────────────────────────────────────────────────┐  │
│  │   [Time Manage]       │  │                     ProjectsView                     │  │
│  │   [Reports]           │  │  ┌────────────────────────────────────────────────┐  │  │
│  │   [Settings]          │  │  │ ProjectToolbar: Search · Filter · View Switch  │  │  │
│  └───────────────────────┘  │  └────────────────────────────────────────────────┘  │  │
│                             │  ┌────────────────────────────────────────────────┐  │  │
│                             │  │   [Bento Grid View]   OR   [Dense Table View]  │  │  │
│                             │  │   (ProjectCardGrid)        (ProjectTableView)  │  │  │
│                             │  └────────────────────────────────────────────────┘  │  │
│                             └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                        ┌────────────────┴────────────────┐
                        ▼                                 ▼
              [ NewProjectModal ]               [ ProjectDetailsDrawer ]
```

### Component Breakdown
1. `components/projects/ProjectsView.tsx`: Main view container containing the filter toolbar and active layout switch.
2. `components/projects/ProjectCardGrid.tsx`: Bento grid presentation with responsive cards.
3. `components/projects/ProjectTableView.tsx`: Accessible, dense data table with status indicators and quick inline actions.
4. `components/projects/NewProjectModal.tsx`: Comprehensive project builder modal.
5. `components/projects/ProjectDetailsDrawer.tsx`: Flyout drawer showing task breakdown, attachments, and logged sprint time for the selected project.
