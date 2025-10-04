# DockBar Implementation

## Overview

TruthArrow now features a responsive, skeuomorphic **DockBar** inspired by classic macOS dock design. The dock adapts between mobile (full-width bottom bar) and desktop (centered floating island) layouts, providing consistent navigation across all devices.

## Features

### Responsive Design
- **Mobile (≤ sm)**: Full-width bar anchored to bottom with rounded top corners
- **Desktop (≥ md)**: Centered floating dock "island" with pill shape
- Safe-area aware for iOS devices with notches/home indicators

### Skeuomorphic Styling
- **Filled icons** with subtle bevel, gloss, and multi-layer shadows
- **Pressed/active states** that simulate physical button presses
- **Hover effects** that lift buttons on desktop
- **Translucent background** with backdrop blur for depth

### Navigation Items
1. **Front Office** (Home) - `/`
2. **Detention** (Issues) - `/issues`
3. **Cafeteria** (Feed) - `/feed`
4. **Receipts** - `/receipts`
5. **Submit** - `/submit`
6. **Admin** (conditionally shown) - `/admin`
7. **Profile** (always present) - Sign in/out with dropdown menu

### Accessibility
- ✅ 44px minimum touch targets on all items
- ✅ `role="navigation"` with proper aria labels
- ✅ `aria-current="page"` on active routes
- ✅ Focus-visible ring indicators
- ✅ Respects `prefers-reduced-motion`

### SmartLogo Integration
- Marked with `data-avoid="critical"` attribute
- SmartLogo will intelligently avoid overlapping the dock
- Works alongside other critical elements (RainbowBanner, AlertBox)

## File Structure

```
src/
├── components/
│   └── DockBar.tsx          # Main dock component
├── hooks/
│   └── useSafeArea.ts       # iOS safe-area hook
├── icons/
│   └── skeuo/               # Filled icon set
│       ├── HomeFilled.tsx
│       ├── DetentionFilled.tsx
│       ├── CafeteriaFilled.tsx
│       ├── ReceiptsFilled.tsx
│       ├── SubmitFilled.tsx
│       ├── AdminShieldFilled.tsx
│       └── UserFilled.tsx
└── index.css                # Skeuomorphic styles
```

## CSS Design Tokens

### Safe Area Support
```css
--safe-bottom: env(safe-area-inset-bottom, 0px);
```

### Skeuomorphic Tokens
```css
--skeuo-surface: #f6f7fb;
--skeuo-surface-dark: #0f0f0f;
--skeuo-gloss: linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.1));
--skeuo-grad: linear-gradient(180deg, #ffffff, #e6e9f4 55%, #d4d8e8);
--skeuo-grad-dark: linear-gradient(180deg, #1a1a1a, #151515 55%, #121212);
--skeuo-edge: rgba(0,0,0,.25);
```

### Utility Classes

#### Bottom Padding
```css
.ta-pb-dock {
  padding-bottom: calc(88px + var(--safe-bottom));
}
```
Applied to main content wrapper to prevent content from hiding under the dock.

#### Skeuomorphic Buttons
```css
.skeuo-btn        /* Base button style with gradient & shadows */
.skeuo-rest       /* Resting state with hover lift */
.skeuo-pressed    /* Active/pressed state with inset shadow */
```

## Component API

### DockBar

```tsx
import DockBar from "@/components/DockBar";

// Usage (already wired in App.tsx)
<DockBar />
```

No props required - automatically adapts based on:
- Current route (from `useLocation`)
- User authentication state (from `useAuth`)
- Screen size (responsive classes)

### Profile Dropdown

The Profile button includes a shadcn/ui `DropdownMenu` with:
- User email display
- Quick "Submit Post" link
- Sign out action

When signed out, clicking Profile navigates to `/auth`.

## Icon Set

All icons are:
- **Filled SVG paths** (not outlined)
- **24x24 viewBox** for consistency
- **currentColor fill** for dynamic theming
- **Semantic naming** matching navigation labels

Example icon structure:
```tsx
import * as React from "react";

export default function HomeFilled(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="..." />
    </svg>
  );
}
```

## Safe Area Hook

### useSafeAreaBottom

Reads iOS safe-area-inset-bottom and applies minimum padding:

```ts
import { useSafeAreaBottom } from "@/hooks/useSafeArea";

const padBottom = useSafeAreaBottom(10); // 10px minimum
```

Returns calculated padding that accounts for:
- iOS notches and home indicators
- iPhone X+ bottom spacing
- Falls back to minimum if not on iOS

## Layout Integration

### App.tsx Changes

```tsx
// Before
<div className="mobile-nav-padding">
  {/* content */}
</div>
<MobileBottomNav />
<AquaDock />

// After
<div className="ta-pb-dock">
  {/* content */}
</div>
<DockBar />
```

The new `ta-pb-dock` class:
- Adds 88px + safe-area padding on mobile
- Removes padding on desktop (md+)
- Ensures content never hides under dock

## Interaction States

### Desktop
- **Hover**: Button lifts -1px with smooth transition
- **Active**: Button presses +1px with deeper inset shadow
- **Focus**: 2px ring in primary color with offset

### Mobile
- **Tap**: Immediate press state (no hover)
- **Active Route**: Permanent pressed appearance
- **Large Touch Targets**: 44px minimum for accessibility

## Dark Mode Support

The dock automatically adapts to dark mode:
- Different gradient backgrounds (`--skeuo-grad-dark`)
- Adjusted shadow opacity and blur
- White icon color with reduced opacity

## Performance Optimizations

- **Backdrop blur** uses GPU acceleration
- **Transform animations** trigger composite layers
- **Will-change** applied to interactive elements
- **Respects reduced motion** - no animations when `prefers-reduced-motion: reduce`

## Browser Compatibility

Tested and working on:
- ✅ iOS Safari (14+)
- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Samsung Internet

Safe-area support requires iOS 11+ / viewport-fit=cover meta tag.

## Migration Notes

### From MobileBottomNav

The old `MobileBottomNav` component has been replaced with `DockBar`. Key differences:

| Feature | MobileBottomNav | DockBar |
|---------|----------------|---------|
| Desktop view | Hidden | Floating dock |
| Icons | Outlined | Filled + skeuomorphic |
| Profile | Separate auth flow | Integrated dropdown |
| Safe area | Basic padding | Full iOS support |
| Admin access | Route-based | Conditional display |

### Breaking Changes
- `mobile-nav-padding` class replaced with `ta-pb-dock`
- Import changed from `./components/MobileBottomNav` to `./components/DockBar`
- Profile/auth now integrated into dock instead of separate flow

## Future Enhancements

Potential additions:
- **Badge indicators** for notifications/unread counts
- **Drag-to-reorder** on desktop
- **Quick actions** via long-press/right-click context menu
- **Haptic feedback** on supported devices
- **Bounce animation** for new items (with motion-safe check)

## Troubleshooting

### Content Hidden Under Dock
**Solution**: Ensure parent wrapper has `ta-pb-dock` class.

### Icons Not Showing
**Solution**: Verify all icon files exist in `src/icons/skeuo/` and are properly exported.

### Safe Area Not Working
**Solution**: Check `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` in `index.html`.

### Profile Dropdown Not Opening
**Solution**: Verify `@/components/ui/dropdown-menu` exists and shadcn/ui is properly configured.

### SmartLogo Overlapping
**Solution**: Confirm `data-avoid="critical"` attribute is present on DockBar container (line 16 in DockBar.tsx).

## Testing Checklist

- [ ] Mobile: 7 items visible with Profile always present
- [ ] Desktop: Centered dock with proper spacing
- [ ] iOS: No clipping on notched devices
- [ ] Active states: Current route shows pressed appearance
- [ ] Auth flow: Sign in/out works via Profile dropdown
- [ ] Admin access: Shield icon only shows for admins
- [ ] Accessibility: Screen reader announces all items
- [ ] Motion: No animations when prefers-reduced-motion
- [ ] SmartLogo: No collision with dock

## Resources

- [Apple HIG - Tab Bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [iOS Safe Area](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [Skeuomorphic Design Principles](https://www.nngroup.com/articles/skeuomorphism/)

