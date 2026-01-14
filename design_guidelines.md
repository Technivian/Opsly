# Ops Copilot Design Guidelines

## Design Approach
**System:** Modern B2B SaaS aesthetic inspired by Linear, Notion, and Asana - emphasizing clarity, productivity, and trust. Clean, focused interface that makes complex automation feel simple and controllable.

## Core Design Elements

### Typography
- **Primary Font:** Inter (via Google Fonts CDN)
- **Headings:** Font weights 600-700, sizes from text-3xl (dashboard titles) to text-sm (table headers)
- **Body:** Font weight 400, text-sm to text-base
- **Code/Technical:** JetBrains Mono for JSON viewers, logs, technical data

### Layout System
**Spacing primitives:** Tailwind units of 3, 4, 6, 8, 12, 16
- Cards/containers: p-6 to p-8
- Section spacing: space-y-6 to space-y-8
- Dense data displays: p-3 to p-4
- Page margins: px-6 lg:px-8

**Grid Structure:**
- Dashboard: 12-column responsive grid
- Data tables: Full-width with max-w-7xl containers
- Forms: max-w-2xl centered for intake wizard

### Component Library

**Navigation:**
- Persistent left sidebar (w-64) with collapsible option on mobile
- Grouped nav items (Dashboard, Intake Management, Automations, Analytics)
- Active state: subtle background fill + accent border-l-2
- Org switcher at sidebar top with dropdown

**Dashboard Shell:**
- Sticky header (h-16) with breadcrumbs, user menu
- "Next recommended action" card prominently placed (top-right or full-width alert-style)
- Quick stats cards in 3-4 column grid: metric value (text-3xl), label, trend indicator

**Cards & Containers:**
- Rounded corners (rounded-lg to rounded-xl)
- Subtle borders (border border-gray-200)
- Hover states: subtle shadow elevation (hover:shadow-md transition-shadow)
- Section headers within cards use border-b dividers

**Data Tables:**
- Striped rows for readability (alternate bg-gray-50)
- Fixed header on scroll
- Status badges (inline, rounded-full, px-2.5 py-0.5, text-xs font-medium)
- Action buttons right-aligned in row

**Forms (Intake Wizard):**
- Step indicator progress bar at top (horizontal stepper with 5-6 steps)
- Large input fields with floating labels or top-aligned labels
- Generous spacing between form groups (space-y-6)
- File upload: drag-and-drop zone with dashed border, icon, helper text
- Navigation: "Back" + "Continue" buttons, sticky bottom bar on mobile

**Blueprint Viewer:**
- Process map: Vertical timeline/flowchart layout using connected cards
- Each step card shows: step number badge, role badge, time estimate, tools list
- Bottlenecks: Red/orange warning cards with icons
- Backlog: Sortable table with priority scores, effort badges (S/M/L chips)

**Automation Templates:**
- Card grid (2-3 columns on desktop, 1 on mobile)
- Template card: icon, name, description, "Configure" CTA button
- Config page: 2-column layout (left: form, right: preview/explanation sticky panel)
- "Run Test" button: prominent, primary style with loading state

**Run Logs:**
- Terminal-style interface: dark background (bg-gray-900), monospace font
- Log entries: timestamp, level badge (color-coded), message
- Auto-scroll with pause button
- Collapsible sections for verbose output

**ROI Dashboard:**
- Hero metrics: 3 large stat cards (hours saved, cycle time %, confidence score)
- Trend charts: Line graph showing weekly progression
- Breakdown table: Automation → runs → impact metrics
- Export/share buttons in top-right

**Modals & Overlays:**
- Center-aligned, max-w-lg to max-w-2xl
- Backdrop blur (backdrop-blur-sm)
- Close button top-right
- Actions footer with "Cancel" + primary action

**Buttons:**
- Primary: solid fill, medium font-weight, px-4 py-2, rounded-md
- Secondary: border style with transparent bg
- Destructive: red variant for delete/remove actions
- Icon buttons: square (h-9 w-9) with centered icon
- Buttons on images: blurred background (backdrop-blur-md bg-white/20)

**Loading States:**
- Skeleton loaders for cards and tables (animate-pulse)
- Spinner for async actions (inline or overlay)
- Progress bars for long-running jobs (blueprint generation)

**Empty States:**
- Centered icon + message + CTA button
- Friendly, action-oriented copy ("Create your first intake")

### Animations
**Minimal usage:**
- Page transitions: fade-in only (no elaborate animations)
- Hover states: simple scale/shadow transitions (duration-200)
- Loading spinners and skeleton pulses only

## Images

**Hero Section (Landing Page):**
Large hero image showcasing a modern operations dashboard or team collaboration scene. Abstract/illustration style showing interconnected workflows, automation symbols, or a clean dashboard UI mockup. Place at top of landing page, full-width, with headline and CTA overlaid using blurred-background buttons.

**Dashboard Illustrations:**
Small spot illustrations for empty states (e.g., inbox zero, no automations configured). Clean, minimalist line art style.

**Template Icons:**
Use Heroicons (via CDN) for all UI icons and template identifiers. Each automation template gets a unique icon (EnvelopeIcon for email triage, UserGroupIcon for lead follow-up).

**Process Blueprint Visuals:**
Node/flow diagrams use geometric shapes and connecting lines (CSS-based, not images).

## Accessibility
- Consistent form inputs with clear labels and focus states
- ARIA labels for icon-only buttons
- Keyboard navigation support for all interactive elements
- Sufficient contrast ratios (WCAG AA minimum)