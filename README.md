# Small Theme

A performance-optimized Booqable theme with comprehensive build system featuring SCSS, JavaScript bundling, image optimization, and Liquid template management.

## Features

- **SCSS Support**: Write modular, maintainable styles with Sass
- **JavaScript Bundling**: Organize JS files with automatic copying
- **Image Optimization**: Automatic image compression and optimization
- **Liquid Template Management**: Structured development workflow for all Booqable components
- **Performance Optimized**: CSS splitting and modular architecture for faster loading
- **Watch Mode**: Real-time compilation during development
- **Clean Build Process**: Automated build pipeline for all assets

## Project Structure

```
small-theme/
├── src/                    # Source files (edit these)
│   ├── scss/              # SCSS files → assets/
│   │   ├── style.scss     # Main stylesheet
│   │   └── components/    # Component styles
│   ├── js/                # JavaScript files → assets/
│   │   ├── main.js        # Main JS entry point
│   │   └── components/    # Component scripts
│   ├── images/            # Images → assets/ (optimized)
│   ├── config/            # Theme configuration → config/
│   ├── layout/            # Theme layouts → layout/
│   ├── sections/          # Theme sections → sections/
│   ├── snippets/          # Theme snippets → snippets/
│   └── templates/         # Theme templates → templates/
├── assets/                # Compiled assets (auto-generated)
├── config/                # Theme config (auto-generated)
├── layout/                # Theme layout (auto-generated)
├── sections/              # Theme sections (auto-generated)
├── snippets/              # Theme snippets (auto-generated)
└── templates/             # Theme templates (auto-generated)
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

## CSS Architecture

The theme supports modular CSS architecture with automatic splitting:

### SCSS Organization

```
src/scss/
├── style.scss              # Main entry point
├── _variables.scss         # Colors, fonts, breakpoints
├── _mixins.scss           # Reusable mixins
├── components/
│   ├── hero.scss          # Component-specific styles
│   └── navigation.scss
└── pages/
    └── home.scss          # Page-specific styles
```

### Performance Benefits

- **Critical CSS Loading**: Load above-the-fold styles first
- **Component-based Organization**: Better maintainability
- **Selective Loading**: Load only required styles per page
- **Better Caching**: Unchanged components stay cached

### CSS Splitting Example

Files compile with preserved directory structure:

- `src/scss/style.scss` → `assets/style.css`
- `src/scss/components/hero.scss` → `assets/components/hero.css`
- `src/scss/pages/home.scss` → `assets/pages/home.css`

Reference in Liquid templates:

```liquid
{{ 'style.css' | asset_url | stylesheet_tag }}
{{ 'components/hero.css' | asset_url | stylesheet_tag }}
{{ 'pages/home.css' | asset_url | stylesheet_tag }}
```

## JavaScript Architecture

Organize JavaScript with the same modular approach:

```
src/js/
├── main.js               # Main entry point
├── components/
│   ├── slider.js         # Component scripts
│   └── modal.js
└── utils/
    └── helpers.js        # Utility functions
```

Files compile to:
- `src/js/main.js` → `assets/main.js`
- `src/js/components/slider.js` → `assets/components/slider.js`

## Image Optimization

Images are automatically optimized and copied with preserved directory structure:

```
src/images/
├── hero.jpg                    → assets/hero.jpg
├── components/
│   ├── slider.jpg             → assets/components/slider.jpg
│   └── modal-bg.jpg           → assets/components/modal-bg.jpg
└── pages/
    └── home/
        └── banner.jpg         → assets/pages/home/banner.jpg
```

The build process compresses images while maintaining quality and subdirectory organization.

## File Collision Handling

The build system handles same-named files in different directories correctly:

- `src/scss/style.scss` and `src/scss/components/style.scss` both compile
- Output: `assets/style.css` and `assets/components/style.css`
- No conflicts, both files coexist

## Liquid Template Development

All Booqable theme files preserve subdirectory structure during compilation:

```
src/
├── config/
│   ├── settings.json              → config/settings.json
│   └── components/
│       └── theme-config.json     → config/components/theme-config.json
├── layout/
│   ├── theme.liquid               → layout/theme.liquid
│   └── components/
│       └── header.liquid          → layout/components/header.liquid
├── sections/
│   ├── hero.liquid                → sections/hero.liquid
│   └── components/
│       └── hero-banner.liquid     → sections/components/hero-banner.liquid
├── snippets/
│   ├── hero-inner.liquid          → snippets/hero-inner.liquid
│   └── components/
│       └── button.liquid          → snippets/components/button.liquid
└── templates/
    ├── home.json                  → templates/home.json
    └── components/
        └── product-card.json      → templates/components/product-card.json
```

## Technologies Used

- **Sass**: CSS preprocessing
- **cpx**: File copying and watching
- **imagemin-cli**: Image optimization
- **Stylelint**: SCSS code linting and formatting
- **ESLint**: JavaScript code linting and formatting
- **Node.js**: Build system runtime

## Code Quality

The project includes comprehensive linting setup with strict formatting and architecture rules:

### SCSS Linting (Stylelint)
- **Indentation**: 2 spaces enforced
- **BEM Naming**: Enforces kebab-case with BEM notation (`.component__element--modifier`)
- **Selector Hierarchy**: Simple to complex selector progression
- **Nesting Control**: Max 8 levels deep with proper `&` usage
- **Color Standards**: Hex codes required, no named colors
- **Specificity Limits**: Prevents overly complex selectors
- Auto-fix capability for formatting issues

### JavaScript Linting (ESLint v9)
- **Modern Flat Config**: Uses `eslint.config.mjs` format
- **ES2021 Features**: Full modern JavaScript support
- **Consistent Style**: 2-space indentation, single quotes, no semicolons
- **Browser Globals**: Pre-configured for web development
- Auto-fix capability for formatting issues

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
