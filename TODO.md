# MarketMind - TODO (Settings Redesigyen)

## Step 1: Layout foundation (two-column)
- Create fixed left sidebar (300px) with premium glassmorphism cards.
- Create right content panel area that fills remaining width up to 1400px max.

## Step 2: Conditional section rendering
- Add state for currently selected settings category (based on `SettingsSectionKey`).
- Render ONLY the selected category; hide all others.
- Add Framer Motion transitions between panels.

## Step 3: Sidebar interaction UX
- Gold hover border + active highlight.
- Smooth sidebar item animations.
- Ensure keyboard accessibility (buttons).

## Step 4: Reuse existing settings logic
- Do not remove existing functionality.
- Reuse current form controls (`SelectChips`, `Toggle`, `TextInput`, `Modal`, `ConfirmDialog`).

## Step 5: Section content mapping
- Profile panel
- Appearance panel
- Trading panel
- AI panel
- Notifications panel
- Security panel
- Privacy/Data panel
- About panel

## Step 6: Validate
- Run TypeScript check / lint (if available).
- Manually verify no crashes and that toggles/chips persist.

✅ Step 0-5: Implemented two-column layout + conditional rendering (requested section only visible) with premium fixed sidebar.


