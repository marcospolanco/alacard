# Figma Make Prompts — Sprint 2025-10-04

Paste any block below directly into the Make prompt field. Each snippet is self-contained; no extra context, frames, or asset notes are required.

## Generator Deck — Desktop

```text
Design the Alacard generator screen at 1440px desktop width. Purpose: let users assemble a recipe of Model, Prompt Pack, Topic, Difficulty, and UI Component cards, trigger the FastAPI generator, and monitor async progress.
- Tokens available: var(--surface), var(--surface-alt), var(--surface-muted), var(--ink), var(--ink-subtle), var(--ink-inverse), var(--border), var(--border-strong), var(--shadow-card), var(--radius-card), var(--radius-lg), var(--radius-pill), var(--focus-ring), var(--cta-primary-bg), var(--cta-primary-hover), var(--cta-secondary-fg), var(--cta-secondary-border), var(--shuffle-bg), var(--shuffle-fg), var(--card-model-*), var(--card-components-*), var(--card-complexity-*).
- Components available: Bar/Recipe, Card/Model, Card/PromptPack, Card/Topic, Card/Difficulty, Card/UIComponent, Button/Primary, Button/Secondary, Button/Shuffle, Badge/Metric, Toast/Notification, Panel/Progress.
- Set frame background var(--surface), text var(--ink); use centered 12-column grid, max content width 1200px, 24px gutters, 40px top/bottom padding.
- Header (64px tall) contains logo + "Alacard Generator" left, Button/Secondary labeled "Open Share Page" right; align to grid, use var(--ink-subtle) for helper copy.
- Place Bar/Recipe directly under header spanning full width; populate chips for each card slot plus share ID placeholder, border var(--border), radius var(--radius-lg), padding 16px, chips spaced 12px.
- Left column spans 7 columns: stack card groups (Model, Prompt Pack, Topic, Difficulty, UI Component) separated by 24px, each titled with Inter 20px/28px weight 600. Use the respective Card components, 16px internal padding, 12px gap, neutral background, selection border var(--border-strong) 2px with focus ring var(--focus-ring) offset 2px.
- Right column spans 5 columns: top Panel/Progress labeled "Generation status" using Panel/Progress component with steps matching FastAPI lifecycle (Queued, Fetching README, Generating Cells, Validating, Ready). Use Badge/Metric inline to show task_id and progress %.
- Add Notebook Preview module beneath progress panel built on Card/UIComponent variant with var(--surface-alt) fill, including summary list of selected cards, estimated runtime, and Supabase share link placeholder.
- Anchor Button/Shuffle (label "Deal me a hand") top-right of left column, Button/Primary bottom-right labeled "Generate Notebook"; button tap order: Shuffle → card groups → Generate.
- Include helper text below primary button: "POST /api/v1/notebook/generate (async)" in var(--ink-subtle); add secondary link-styled text "View task in Supabase".
- Accessibility: focus outlines 2px var(--focus-ring), announce progress updates via ARIA live region callout inside Panel/Progress.
Does any component variant need clarification before rendering?
```

## Shuffle Feedback State — Desktop

```text
Design the shuffle feedback screen at desktop width that appears immediately after users press "Deal me a hand". Purpose: surface newly dealt cards, confirm async task reset, and direct users to generate or tweak.
- Use same grid, tokens, and component set as the Generator screen; background var(--surface), text var(--ink).
- Dim overall stage with 70% var(--surface-muted) overlay excluding Bar/Recipe and progress panel; use mask to keep header and toast crisp.
- Highlight every card that changed with Badge/Metric labeled "New combo" top-left; badge uses var(--shuffle-bg) background, text var(--shuffle-fg), icon 🎴.
- Display Button/Shuffle in pressed state: fill var(--cta-primary-hover), outline var(--focus-ring), white label; add microcopy "Cards reshuffled" directly under button.
- Update Bar/Recipe chips to reflect new selections and show inline status pill "Queued" with badge tokens.
- Show Panel/Progress reset to step "Queued" with progress 0%; include note "Waiting on POST /api/v1/notebook/generate" under timeline.
- Add floating Toast/Notification centered above footer width 360px, copy "New recipe ready — tweak cards or generate", CTA inside toast labeled "Generate now" using Button/Primary (small variant).
- Annotate motion: cards lift 8px, staggered 40ms, easing 160ms ease-out, then settle; include italic caption describing the motion beside deck.
- Accessibility: ensure focus order returns to top card group post-animation, Toast traps focus until dismissed via ESC.
Any styling conflicts or missing tokens before we proceed?
```

## Share Page — Desktop

```text
Design the public share page for a generated notebook at desktop width. Purpose: present the saved recipe, surface download/remix actions, and show FastAPI validation state.
- Available tokens: var(--surface), var(--surface-alt), var(--surface-muted), var(--ink), var(--ink-subtle), var(--border), var(--border-strong), var(--radius-card), var(--radius-lg), var(--shadow-card), var(--focus-ring), var(--cta-primary-bg), var(--cta-secondary-fg), var(--cta-secondary-border), var(--card-model-*), var(--card-components-*), var(--card-complexity-*).
- Components: Bar/Recipe, Card/Model, Card/PromptPack, Card/Topic, Card/Difficulty, Card/UIComponent, Badge/Metric, Button/Primary, Button/Secondary, Tabs/NotebookMeta, Panel/Validation.
- Frame background var(--surface); 1120px max-width centered with 32px vertical rhythm, 24px gutters.
- Top Bar/Recipe (read-only mode) shows notebook title, emoji tags, share_id, task_id, and view/remix counts via Badge/Metric; include secondary action "Open in Generator" as Button/Secondary.
- Main layout split 8/4 columns with 24px gap:
  - Left: grid of locked card components (Model, Prompt Pack, Topic, Difficulty, UI Component) arranged in two rows with 24px gaps; disable hover states, show badge "Selected" top-right.
  - Right: stack Tabs/NotebookMeta with tabs for "Metadata", "Activity", "API". Metadata tab lists download_count, remix_count, created_at, validation status; Activity tab summarises last five events; API tab shows curl snippet hitting `GET /api/v1/notebook/{share_id}` and download endpoint.
- Below cards, place Panel/Validation summarizing latest validation results from `GET /api/v1/notebook/{share_id}/validation`; include success check or failure alert.
- Primary actions grouped in right column footer: Button/Primary full width "Download .ipynb" (links to `GET /api/v1/notebook/download/{share_id}`) and Button/Secondary "Copy share link"; add tertiary text link "Report issue".
- Accessibility: ensure tab order Bar/Recipe → left cards → validation panel → actions; focus ring 2px var(--focus-ring) offset 2px on buttons.
Do you need any additional metadata fields exposed before rendering?
```

## Remix Entry — Desktop

```text
Design the remix entry experience that opens when a user clicks "Open in Generator" from a shared notebook. Purpose: preload the generator with the shared recipe, show provenance, and encourage edits before generating a remix task.
- Use same token and component inventory as the Generator screen plus Badge/Metric, Panel/Progress, Toast/Notification.
- Apply generator layout (12-column, 1200px max width, 24px gutters) with background var(--surface), text var(--ink).
- Add Remix banner above Bar/Recipe using Bar/Recipe variant with accent var(--card-components-accent); headline "Remixing share {share_id}" and subcopy "Fork of {origin_author}" with timestamp.
- Bar/Recipe chips display original selections with inline badges "Original"; include CTA Button/Secondary "View source share" linking to share page.
- Prefill card stacks with Card components marked selected; add sublabel under each section "Imported from share" in var(--ink-subtle). When a card changes state, show Badge/Metric "Edited" top-right and animate border to var(--card-complexity-medium-*) for 240ms.
- Right column Panel/Progress shows existing completion summary (status: Ready, task_id, download link) and new remix timeline (Queued → Generating → Validating). Add inset area for WebSocket status with last ping timestamp.
- Place control row above cards: Button/Shuffle, text button "Reset to original", icon button (tooltip) explaining remix rules; align to grid with 12px gaps.
- Footer actions: Button/Primary "Generate Remix" (points to POST /api/v1/notebook/generate with `forked_from` metadata), Button/Secondary "Cancel Remix", tertiary text link "View validation" referencing validation endpoint.
- Add helper toast bottom center when remix generation starts: Toast/Notification with copy "Remix task submitted — watching WebSocket /ws/progress/{task_id}" and dismiss icon.
- Accessibility: maintain focus order banner → controls → card stacks → preview → actions; announce toast via ARIA live region.
Anything else needed before handing off this remix layout?
```
