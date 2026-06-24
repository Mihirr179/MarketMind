# MarketMind Refactor - Theme + Profile Dropdown

## Step 1 — Theme system foundation
- [ ] Add ThemeContext (React Context) with localStorage persistence
- [ ] Implement default theme = Dark and resolve `system` mode
- [ ] Update `app/layout.tsx` / `LayoutShell.tsx` / global wrappers to apply theme classes
- [ ] Refactor `app/globals.css` to use theme variables for both Dark and Light

## Step 2 — Profile dropdown + remove duplicate profile/logout
- [ ] Create `components/ui/ProfileDropdown.tsx` (glassmorphism card, yellow accent, animation)
- [ ] Update `components/TopNavbar.tsx` to remove standalone logout and use the dropdown
- [ ] Refactor `components/dashboard/TerminalTopNav.tsx` to avoid duplicate profile section if applicable

## Step 3 — Settings page spec
- [ ] Update `app/settings/page.tsx` appearance section: Dark / Light / System
- [ ] Add UI preferences: Compact / Expanded
- [ ] Persist all settings in localStorage

## Step 4 — Apply theme across app
- [ ] Update core UI components (Sidebar, GlassCard, inputs/buttons) to use theme variables
- [ ] Update dashboard components: Watchlist, Portfolio, Search, News, AI Research, charts/tables/modals/dropdowns

## Step 5 — Polish
- [ ] Add smooth transitions for theme switching and hover states
- [ ] Run lint/build and fix any TS/Next issues

## Step 6 — Verify requirements
- [ ] Only one profile area exists
- [ ] Logout inside profile dropdown only
- [ ] Theme persists after refresh
- [ ] Theme toggle switches entire application

