# ryOS Aesthetic Implementation

## Overview

TruthArrow now features a comprehensive ryOS-inspired skeuomorphic design system throughout the site, emulating the classic Mac OS X Aqua aesthetic while maintaining a minimal, news-oriented approach.

## Design Tokens

All design tokens are defined in `src/index.css` and exposed via Tailwind CSS utilities:

### Colors
- **Primary**: Mac OS X Aqua blue (`hsl(211 100% 45%)`)
- **Background**: Gradient from `hsl(203 89% 53%)` to darker blues
- **Surface colors**: Light, neutral tones for panels and cards

### Shadows (Skeuomorphic Depth)
- `shadow-skeu-raised-sm`: Subtle raised effect
- `shadow-skeu-raised`: Standard raised effect with multi-layer shadows
- `shadow-skeu-raised-lg`: Enhanced raised effect for hover states
- `shadow-skeu-inset`: Recessed/sunken appearance
- `shadow-skeu-pressed`: Deep inset for active/pressed states

### Gradients
- `bg-gradient-surface`: Glossy Aqua-style surface gradient
- `bg-gradient-gold`: Gold gradient for primary buttons

## Applied Styling

### Navigation & Layout
- **Navbar**: Uses `bg-gradient-surface` with `shadow-skeu-raised` for a floating menubar effect
- **Footer**: Subtle `shadow-skeu-inset` with gradient surface
- **Hero Section**: Inset shadow to create depth beneath the header image

### Content Sections (Index Page)
All major sections are wrapped in window-style panels:
- Rounded corners (`rounded-lg`)
- Raised shadows (`shadow-skeu-raised`)
- Gradient surface background (`bg-gradient-surface`)
- Border outlines (`border border-border`)
- Optional window control dots (red/yellow/green) via `<WindowControls />`

### Cards
- **PostCard**: Gradient surface, raised shadows, hover lift effect (`hover:shadow-skeu-raised-lg`)
- **IssueCard**: Same treatment with active pressed state (`active:shadow-skeu-pressed`)
- **ComposeBox**: Focus state triggers larger shadow for depth

### Buttons
All button variants include skeuomorphic effects (defined in `src/components/ui/button.tsx`):
- Default: Gold gradient with raised shadow
- Outline: Gradient surface with border, hover raises shadow
- Interactive class: `.skeu-interactive` for hover and active states

### Inputs
- Inset shadow (`shadow-skeu-inset`) to appear recessed
- Focus state deepens shadow (`focus-visible:shadow-skeu-pressed`)
- Gradient surface background

### Interactive States
- **Hover**: Enlarged shadow (`hover:shadow-skeu-raised-lg`) creates lift effect
- **Active/Pressed**: Inset shadow (`active:shadow-skeu-pressed`) with slight Y translation
- **Transitions**: 200ms ease-out for smooth animations

## Components

### WindowControls Component
Located at `src/components/WindowControls.tsx`

Provides decorative Mac-style window control dots (red, yellow, green). Used in section headers to reinforce the OS window metaphor.

```tsx
import { WindowControls } from '@/components/WindowControls';

<div className="flex items-center gap-3">
  <WindowControls />
  <h2>Section Title</h2>
</div>
```

## Usage Guidelines

### For New Components
When creating new components, apply the aesthetic by:

1. **Container/Panel**: Use `bg-gradient-surface shadow-skeu-raised border border-border rounded-lg`
2. **Interactive Elements**: Add `skeu-interactive` class or manual hover/active shadow transitions
3. **Inputs/Forms**: Use the `Input` component which has inset styling built-in
4. **Buttons**: Use the `Button` component (already styled)

### Consistent Pattern
```tsx
<div className="bg-gradient-surface shadow-skeu-raised border border-border rounded-lg p-6 transition-all hover:shadow-skeu-raised-lg">
  {/* Content */}
</div>
```

## Philosophy

The ryOS aesthetic is applied minimally and tastefully:
- **Depth without clutter**: Shadows and gradients add visual hierarchy without overwhelming content
- **News-first**: Content remains scannable and accessible
- **Playful authenticity**: Window controls and OS metaphors add character without sacrificing usability
- **Responsive interactions**: Hover and active states provide tactile feedback

## Browser Compatibility

All effects use standard CSS box-shadow and gradients, with broad browser support. Transitions respect `prefers-reduced-motion` for accessibility.

## Future Enhancements

Consider adding:
- Pop-in animations for new content (already implemented via `.pop-in` utility)
- Sound effects for interactions (optional, likely too playful for a news site)
- Additional window chrome elements (minimize/maximize buttons, etc.)
- Drag-and-drop reordering with window-like interactions

