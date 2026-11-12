# TODO - GammaX Project

This document outlines the remaining tasks to complete the GammaX project, based on the `PRD.md` and a review of the existing codebase.

## High Priority

### 1. Implement Slide Editor (`SlideEditor.tsx`)
This is the most critical missing feature. The user needs to be able to edit the generated presentations.

- [ ] Create `src/components/SlideEditor.tsx`.
- [ ] Add the `SlideEditor` to `App.tsx` to allow users to edit the currently selected slide.
- [ ] Implement a basic text editing interface for the slide's title.
- [ ] Implement a content editing interface that changes based on the slide's layout (`slide.layout`).
    - [ ] `title` layout: Allow editing of title and a single content line.
    - [ ] `bullets` layout: Allow adding, removing, and editing bullet points.
    - [ ] `two-column` layout: Allow editing of content in two columns.
    - [ ] `quote` layout: Allow editing the quote and the citation.
    - [ ] `image-text` layout: Allow editing of the text content.
    - [ ] `split-image` layout: Allow editing of the text content.
    - [ ] `full-image` layout: Allow editing of the text content.
- [ ] Implement image replacement functionality.

### 2. Improve AI Generator (`aiGenerator.ts`)
The current generator is a mock. It needs to be improved to provide a more realistic experience.

- [ ] Add support for all layouts specified in the PRD: `content`, `split-image`, `full-image`.
- [ ] Remove layouts not in the PRD: `stats-grid`, `timeline`, `comparison`.
- [ ] Make the generated content more varied and realistic, perhaps by using a larger set of templates or a more sophisticated generation logic.
- [ ] Ensure every presentation includes at least 2-3 slides with AI-generated images, as per the PRD.

## Medium Priority

### 3. Enhance Loading Experience
The PRD specifies a "multi-stage animated loading screen".

- [ ] Create a new component `GeneratingState.tsx` that shows different stages of the generation process (e.g., "Generating outline...", "Designing slides...", "Generating images...").
- [ ] Replace the simple loading spinner in `App.tsx` with this new component.

### 4. Integrate Missing UI Components
Several components exist in the `src/components` directory but are not used in the application.

- [ ] Integrate `AnalyticsView.tsx`, `StatsCard.tsx`, and `TrendChart.tsx` into a new "Analytics" view.
- [ ] Integrate `CreditsModal.tsx`. The credit count is displayed, but there's no way to see the modal.
- [ ] Create a proper "Dashboard" view that includes `PresentationList` and analytics components.

## Low Priority

### 5. Code Cleanup and Refactoring
- [ ] There are many unused icons imported in `App.tsx`. These should be removed.
- [ ] Some components like `ErrorList.tsx`, `FileUpload.tsx`, `FolderModal.tsx`, `ImportDropdown.tsx`, `SupportWidget.tsx`, `UpdatesDropdown.tsx` exist but are not used. A decision should be made whether to implement or remove them.
- [ ] The `EcosystemViews.tsx` file exports several views that are not fully implemented or described in the PRD. These should be reviewed.

## Layout Discrepancy

There is a significant discrepancy between the layouts defined in the PRD, the layouts used by the mock `aiGenerator.ts`, and the layouts available in `SlidePreview.tsx`.

*   **PRD:** `title`, `content`, `bullets`, `two-column`, `quote`, `image-text`, `split-image`, `full-image`.
*   **`aiGenerator.ts`:** `title`, `stats-grid`, `bullets`, `quote`, `timeline`, `comparison`, `two-column`, `image-text`.
*   **`SlidePreview.tsx`:** `title`, `bullets`, `two-column`, `quote`, `image-text`, `split-image`, `full-image`, `flowchart`, `diagram`, `chart`, `stats-grid`, `heatmap`, `gauge`, `timeline`, `comparison`, `feature-grid`, `before-after`, `portfolio`, `sankey`, `waterfall`, `content`.

The `SlidePreview.tsx` is the most feature-rich. The `aiGenerator.ts` should be updated to generate all the layouts specified in the PRD, and `SlidePreview.tsx` should be confirmed to render them correctly. The extra layouts in `SlidePreview.tsx` can be considered a bonus, but the core PRD layouts must be supported.
