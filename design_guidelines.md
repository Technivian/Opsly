# Opsly Design Guidelines

## Design Approach
**System:** Modern B2B SaaS aesthetic inspired by Linear and Notion - emphasizing clarity, sophistication, and trust. Muted, refined interface with subtle contrasts. Dark mode is the primary design target with light mode as an alternative. Professional, handcrafted feel avoiding template-driven patterns.

## Color Palette

**Dark Mode (Primary):**
- **Background:** Deep slate (gray-950, gray-900)
- **Surface:** Elevated slate (gray-900, gray-800)
- **Borders:** Subtle slate (gray-800, gray-700)
- **Text Primary:** Off-white (gray-100)
- **Text Secondary:** Muted gray (gray-400)
- **Accent Primary:** Soft indigo (indigo-400, muted 30% from default)
- **Accent Secondary:** Muted violet (violet-400, desaturated)
- **Success:** Muted emerald (emerald-500, desaturated)
- **Warning:** Soft amber (amber-600, muted)
- **Error:** Muted rose (rose-500, desaturated)

**Light Mode (Alternative):**
- **Background:** Warm off-white (gray-50)
- **Surface:** Pure white with subtle warmth
- **Borders:** Light slate (gray-200)
- **Text Primary:** Deep slate (gray-900)
- **Text Secondary:** Mid-gray (gray-600)
- **Accent Primary:** Deep indigo (indigo-600, muted)
- **Accent Secondary:** Deep violet (violet-600, desaturated)

**Status Badges:**
- Draft: slate-500 background, slate-200 text (dark mode)
- In Progress: indigo-500/20 background, indigo-300 text
- Completed: emerald-500/20 background, emerald-300 text
- Error: rose-500/20 background, rose-300 text

## Typography
- **Primary Font:** Inter (Google Fonts CDN)
- **Headings:** Weights 600-700, sizes text-3xl (page titles) → text-sm (table headers)
- **Body:** Weight 400, text-sm to text-base
- **Code/Technical:** JetBrains Mono for JSON, logs, technical displays
- **Hierarchy:** Clear contrast through weight and size, not color alone

## Layout System
**Spacing Primitives:** Tailwind units 3, 4, 6, 8, 12, 16
- Cards/containers: p-6 to p-8
- Section spacing: space-y-6 to space-y-8
- Dense tables: p-3 to p-4
- Page margins: px-6 lg:px-8

**Grid Structure:**
- Dashboard: 12-column responsive grid
- Data tables: Full-width with max-w-7xl
- Forms: max-w-2xl centered

## Component Library

**Navigation:**
- Persistent left sidebar (w-64), collapsible on mobile
- Dark slate background (gray-900) with indigo accent for active states
- Border-l-2 accent on active items with subtle background fill
- Org switcher dropdown at top with refined styling

**Dashboard Shell:**
- Sticky header (h-16) with breadcrumbs, user menu
- "Next recommended action" card: full-width alert-style with soft indigo accent border-l-4
- Stats cards: 3-4 column grid, metric value (text-3xl font-semibold), muted labels, subtle trend arrows

**Cards & Containers:**
- Rounded corners (rounded-lg to rounded-xl)
- Subtle borders in slate tones
- Hover: gentle shadow elevation (shadow-lg with dark mode adjustment)
- Headers with border-b dividers in muted slate

**Data Tables:**
- Alternating row backgrounds (gray-900/gray-800 in dark mode)
- Fixed headers on scroll
- Status badges: rounded-full, px-2.5 py-0.5, text-xs font-medium
- Action buttons: ghost style, right-aligned

**Forms (Intake Wizard):**
- Horizontal progress stepper (5-6 steps) with indigo accent for completed
- Generous input spacing (space-y-6)
- Floating or top-aligned labels in muted gray
- File upload: dashed border zone with soft indigo accent on hover
- Sticky bottom navigation bar on mobile

**Blueprint Viewer:**
- Vertical timeline with connected cards
- Step cards: number badge, role badge, time estimate, tool chips
- Bottleneck warnings: muted rose accent cards
- Backlog table: priority scores with S/M/L effort badges in slate tones

**Automation Templates:**
- Card grid (2-3 columns desktop, 1 mobile)
- Template cards: Heroicon, title, description, "Configure" button
- Config layout: 2-column (left form, right sticky preview panel)
- "Run Test" button: primary indigo with loading spinner

**Run Logs:**
- Terminal interface: deep slate background (gray-950)
- Monospace font with color-coded severity levels
- Timestamp in muted gray, level badges in subtle accent colors
- Auto-scroll with pause toggle

**ROI Dashboard:**
- Hero metrics: 3 large stat cards (hours saved, cycle time reduction, confidence)
- Line charts: indigo/violet gradients for trend visualization
- Breakdown table with automation impact metrics
- Export button: secondary style, top-right

**Modals:**
- Center-aligned, max-w-lg to max-w-2xl
- Dark slate surface with backdrop blur
- Close button (gray-400) top-right
- Action footer: ghost "Cancel" + primary CTA

**Buttons:**
- Primary: Soft indigo fill, medium weight, px-4 py-2, rounded-md
- Secondary: Slate border with transparent bg
- Destructive: Muted rose variant
- Icon buttons: square (h-9 w-9), centered icon
- Buttons on images: backdrop-blur-md with bg-white/10 in dark mode

**Loading States:**
- Skeleton loaders: subtle pulse in slate tones
- Spinners: soft indigo color
- Progress bars: indigo fill on slate track

**Empty States:**
- Centered Heroicon + message + CTA
- Friendly, action-oriented copy in muted gray text

## Images

**Hero Section (Landing Page):**
Large hero image showing a sophisticated operations dashboard in dark mode - featuring interconnected workflow visualizations, automation nodes, and clean data displays. Modern, abstract illustration style with muted slate and indigo tones. Full-width placement with headline and CTA overlaid using blurred-background buttons (backdrop-blur-md bg-white/10).

**Dashboard Illustrations:**
Minimalist spot illustrations for empty states using line art in muted slate with soft indigo accents. Clean geometric style matching Linear's aesthetic.

**Icons:**
Heroicons (via CDN) throughout - each automation template assigned unique icon (EnvelopeIcon, UserGroupIcon, etc.) in muted slate tones.

## Animations
Minimal usage only:
- Page transitions: subtle fade-in (duration-200)
- Hover states: gentle scale/shadow (no elaborate effects)
- Loading: spinner and skeleton pulse only

## Accessibility
- Sufficient contrast in both modes (WCAG AA)
- Clear focus states with indigo accent rings
- ARIA labels for icon-only buttons
- Full keyboard navigation support