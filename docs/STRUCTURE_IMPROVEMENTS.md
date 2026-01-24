# Code Structure Improvements

We have reorganized the project structure to improve maintainability and scalability.

## 1. Documentation
All documentation and implementation guides have been moved to the `docs/` directory to declutter the project root.

## 2. Component Architecture
We have adopted a feature-based architecture for components in `src/components/`:

### `common/`
Reusable, generic UI components that are used across the application.
- `MarkdownText`: Markdown rendering.
- `ThemeToggle`: Light/Dark mode toggle.
- `ImageRefinementButton`: UI for refining images.

### `layout/`
Structural components that define the application layout.
- `Header`: Main navigation header.

### `features/`
Components grouped by specific business logic or feature sets.

#### `auth/`
Authentication-related components.
- `AuthGuard`: Protects routes requiring authentication.
- `AuthHandler`: Handles auth redirects/callbacks.

#### `chat/`
Components specific to the chat interface.
- `ChatHistory`: Sidebar for chat sessions.
- `PromptChainModal`: Modal for prompt chaining/refinement.

#### `presets/`
Components for the specific "Presets" feature.
- `SidebarPresets`: Sidebar for selecting styles.
- `PresetManager`: Advanced preset management modal.
- `presetEditors/`: Specific editors for different preset types.

## 3. Benefits
- **Scalability**: Easier to add new features without cluttering a single folder.
- **Discoverability**: Related components are co-located.
- **Maintainability**: Clear separation of concerns between generic UI and business logic.
