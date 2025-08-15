# Small Theme

A performance-optimized Booqable theme with comprehensive build system featuring SCSS, JavaScript bundling, image optimization, and Liquid template management.

## Features

- **SCSS Support**: Write modular, maintainable styles with Sass
- **Responsive Design**: Built-in breakpoint mixins for consistent responsive behavior
- **JavaScript Bundling**: Organize JS files with automatic copying
- **Image Optimization**: Automatic image compression and optimization
- **Liquid Template Management**: Structured development workflow for all Booqable components
- **Performance Optimized**: CSS splitting and modular architecture for faster loading
- **Watch Mode**: Real-time compilation during development
- **Code Quality**: Comprehensive linting with auto-fix capabilities
- **Clean Build Process**: Automated build pipeline for all assets

## Project Structure

```
small-theme/
├── src/                          # Source files (edit these)
│   ├── scss/                     # SCSS files → assets/
│   │   ├── styles.scss           # Main stylesheet entry point
│   │   ├── _variables.scss       # Theme variables & breakpoints
│   │   ├── _base/                # Base styles
│   │   │   ├── _base.scss        # Base layout styles
│   │   │   ├── _forms.scss       # Form elements
│   │   │   ├── _typography.scss  # Typography styles
│   │   │   └── _rx.scss          # Rich content styles
│   │   ├── _components/          # Component styles
│   │   │   └── _button.scss      # Button components
│   │   └── _helpers/             # Mixins and utilities
│   │       └── _mixins.scss      # Responsive mixins
│   ├── js/                       # JavaScript files → assets/
│   │   └── main.js               # Common JS file
│   ├── images/                   # Images → assets/ (optimized)
│   ├── config/                   # Theme configuration → config/
│   │   ├── settings_data.json
│   │   └── settings_schema.json
│   ├── layout/                   # Theme layouts → layout/
│   │   └── theme.liquid
│   ├── sections/                 # Theme sections → sections/
│   ├── snippets/                 # Theme snippets → snippets/
│   └── templates/                # Theme templates → templates/
│       └── index.json
├── assets/                       # Compiled assets (auto-generated)
├── config/                       # Theme config (auto-generated)
├── layout/                       # Theme layout (auto-generated)
├── sections/                     # Theme sections (auto-generated)
├── snippets/                     # Theme snippets (auto-generated)
└── templates/                    # Theme templates (auto-generated)
```

## Getting Started

### Installation

```bash
npm install
```

### Development

Start development mode with file watching:

```bash
npm run dev
```

This will:
1. Build all assets
2. Watch for changes and rebuild automatically

### Building

Build all assets for production:

```bash
npm run build
```

## Available Commands

### Main Commands

- `npm run dev` - Start development mode (build + watch)
- `npm run build` - Build all assets for production
- `npm run clean` - Clean all generated files
- `npm run lint` - Run all linters (SCSS + JavaScript)
- `npm run lint:fix` - Run all linters with auto-fix

### Individual Build Commands

- `npm run build:scss` - Compile SCSS to CSS
- `npm run build:js` - Copy and process JavaScript files
- `npm run build:images` - Optimize images
- `npm run build:liquid` - Copy all Liquid templates and config

### Watch Commands

- `npm run watch` - Watch all file types
- `npm run watch:scss` - Watch SCSS files only
- `npm run watch:js` - Watch JavaScript files only
- `npm run watch:images` - Watch image files only
- `npm run watch:liquid` - Watch all Liquid templates and config

### Linting Commands

- `npm run lint:scss` - Lint SCSS files only
- `npm run lint:js` - Lint JavaScript files only
- `npm run lint` - Run all linters
- `npm run lint:fix` - Run all linters with auto-fix

## Responsive Design

The theme includes powerful responsive mixins for consistent breakpoint handling:

### Breakpoint Variables
```scss
$breakpoint-xs: 480px;
$breakpoint-sm: 768px;
$breakpoint-md: 992px;
$breakpoint-lg: 1280px;
$breakpoint-xl: 1440px;
$breakpoint-xxl: 1920px;
```

### Usage Examples
```scss
.container {
  width: 100%;
  padding: 1rem;

  // Mobile-first approach: styles apply from sm breakpoint and up
  @include media-up(sm) {
    max-width: 540px;
    margin: 0 auto;
  }

  // Only applies to tablets (md breakpoint only)
  @include media-only(md) {
    padding: 2rem;
  }

  // Desktop and up
  @include media-up(lg) {
    max-width: 960px;
  }

  // Between md and lg breakpoints only
  @include media-between(md, lg) {
    background: #f5f5f5;
    border-radius: 8px;
  }

  // Hide on small screens (below sm breakpoint)
  @include media-down(sm) {
    display: none;
  }
}
```

### Available Mixins
- `media-up(breakpoint)` - Min-width media query
- `media-down(breakpoint)` - Max-width media query
- `media-only(breakpoint)` - Target specific breakpoint range
- `media-between(lower, upper)` - Between two breakpoints

## CSS Architecture

The theme supports modular CSS architecture:

### SCSS Organization

```
src/scss/
├── styles.scss            # Main entry point
├── _variables.scss        # Colors, fonts, breakpoints
├── _base/                 # Foundation styles
│   ├── _base.scss         # Base layout and resets
│   ├── _forms.scss        # Form elements and inputs
│   ├── _typography.scss   # Typography styles
│   └── _rx.scss           # Rich content styles
├── _components/           # Components
│   └── _button.scss       # Button component styles
└── _helpers/              # Utilities and mixins
    └── _mixins.scss       # Responsive breakpoint mixins
```

### Performance Benefits

- **Modular Architecture**: Better maintainability and organization
- **Variable System**: Consistent theming with CSS custom properties
- **Responsive Mixins**: Consistent breakpoint handling across components
- **Build Optimization**: Compressed CSS output for production

### CSS Output Example

Main stylesheet compiles to compressed CSS:

- `src/scss/styles.scss` → `assets/styles.css`

Reference in Liquid templates:

```liquid
{{ 'styles.css' | asset_url | stylesheet_tag }}
{{ 'components/hero.css' | asset_url | stylesheet_tag }}
{{ 'pages/home.css' | asset_url | stylesheet_tag }}
```

## JavaScript Architecture

Organize JavaScript with a modular approach:

```
src/js/
├── main.js               # Common JavaScript code
├── components/           # Component-specific scripts
│   ├── slider.js         # Slider functionality
│   └── modal.js          # Modal components
└── utils/                # Utility functions
    └── helpers.js        # Helper functions
```

Files are copied with preserved directory structure:
- `src/js/example.js` → `assets/example.js`
- `src/js/components/slider.js` → `assets/components/slider.js`

Reference in Liquid templates:
```liquid
{{ 'example.js' | asset_url | script_tag }}
{{ 'components/slider.js' | asset_url | script_tag }}
```

## Image Optimization

Images are automatically optimized and copied with preserved directory structure:

```
src/images/
├── hero.jpg                → assets/hero.jpg
├── components/
│   ├── slider.jpg          → assets/components/slider.jpg
│   └── modal-bg.jpg        → assets/components/modal-bg.jpg
└── pages/
    └── home/
        └── banner.jpg      → assets/pages/home/banner.jpg
```

The build process compresses images while maintaining quality and subdirectory organization.

## File Collision Handling

The build system handles same-named files in different directories correctly:

- `src/scss/styles.scss` and `src/scss/components/styles.scss` both compile
- Output: `assets/styles.css` and `assets/components/styles.css`
- No conflicts, both files coexist

## Liquid Template Development

All Booqable theme files preserve subdirectory structure during compilation:

### Current Project Structure
```
src/
├── config/                         # Theme configuration
│   ├── settings_data.json          → config/settings_data.json
│   └── settings_schema.json        → config/settings_schema.json
├── layout/                         # Theme layouts
│   └── theme.liquid                → layout/theme.liquid
├── sections/                       # Theme sections (add your sections here)
│   └── hero.liquid                 → sections/hero.liquid
├── snippets/                       # Reusable snippets
│   ├── fonts.liquid                → snippets/fonts.liquid
└── templates/                      # Page templates
    └── index.json                  → templates/index.json
```

### Theme Configuration Files
- `settings_data.json`: Current theme settings and values
- `settings_schema.json`: Theme customization options and controls
- Includes configurations for typography, colors, buttons, and styling options

## Technologies Used

- **Sass**: CSS preprocessing
- **cpx**: File copying and watching
- **imagemin-cli**: Image optimization
- **Stylelint**: SCSS code linting and formatting
- **ESLint**: JavaScript code linting and formatting
- **Node.js**: Build system runtime

## Code Quality

The project includes comprehensive linting setup for maintaining code quality:

### SCSS Linting (Stylelint)
- **Base Configuration**: Uses `stylelint-config-standard-scss`
- **Relaxed Rules**: Configured for existing codebase compatibility
- **Focus Areas**: Syntax errors, duplicate selectors, font-family duplicates
- **Auto-fix**: Run `npm run lint:fix` to automatically fix formatting issues
- **No Breaking Changes**: Rules adapted to work with current architecture

### JavaScript Linting (ESLint v9)
- **Modern Standards**: ES2021 features supported
- **Style Guidelines**:
  - Single quotes enforced (`'string'` not `"string"`)
  - No semicolons required
  - 2-space indentation
- **Console Statements**: Allowed with explicit disable comments
- **Auto-fix**: Run `npm run lint:fix` to automatically fix formatting issues

### Running Linters
```bash
# Run all linters
npm run lint

# Run individual linters
npm run lint:scss
npm run lint:js

# Auto-fix issues where possible
npm run lint:fix
```

## Development Workflow

1. Edit files in `src/` directory
2. Run `npm run dev` for development
3. Files automatically compile to theme directories
4. Test in Booqable
5. Run `npm run build` for production

## File Synchronization

The build system provides true file synchronization:

- **Added files**: Automatically compiled to output directories
- **Modified files**: Recompiled on save during watch mode
- **Deleted files**: Removed from output directories during build
- **Clean builds**: `npm run dev` starts with a clean slate
- **Manual cleanup**: Use `npm run clean` to reset all output directories

This ensures your output directories always match your source files exactly.

## GitHub Actions Workflows

The project includes automated workflows for continuous integration:

### 🔄 CI Workflow (`ci.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests to `main`
- **Node.js versions**: 18.x, 20.x (matrix testing)
- **Actions**: Install deps → Run linters → Build → Upload artifacts
- **Artifacts**: Built theme files retained for 7 days

### 🔍 PR Checks (`pr-checks.yml`)
- **Triggers**: Pull Requests to `main`/`develop`
- **Actions**: SCSS/JS linting → Build test → Auto-comment results
- **Features**: Detailed code quality report in PR comments

### 📦 Dependency Updates (`dependency-update.yml`)
- **Triggers**: Weekly schedule (Mondays 9 AM UTC) + Manual
- **Actions**: Update deps → Security audit → Test → Create PR
- **Benefits**: Automated security updates and dependency maintenance

## Performance Considerations

- SCSS compiles with compressed output
- Images are automatically optimized
- Modular CSS architecture enables selective loading
- Watch mode prevents unnecessary rebuilds
- Clean command removes all generated files

---

Built with performance and developer experience in mind for Booqable themes.
