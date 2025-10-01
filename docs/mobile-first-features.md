# TruthArrow Mobile-First Features

## Overview
TruthArrow implements comprehensive mobile-first design patterns to ensure an optimal experience on smartphones and tablets.

## Key Mobile Features

### 1. Bottom Navigation Bar
- **Component**: `MobileBottomNav.tsx`
- **Location**: Fixed bottom bar (hidden on desktop)
- **Features**:
  - 4 primary navigation items: Home, Issues, Feed, Receipts
  - Active state indicators with color and underline
  - Touch-friendly ≥64px tap targets
  - Safe-area aware (respects device notches)
  - Smooth active state animations

### 2. Mobile Drawer Menu
- **Component**: `MobileDrawer.tsx`
- **Trigger**: Menu icon in navbar (mobile only)
- **Features**:
  - Slide-in from right with backdrop
  - Secondary navigation (Search, Submit, About, Admin)
  - Sign in/out actions
  - Smooth 300ms slide animation
  - Keyboard accessible (Escape to close)
  - Safe-area padding for notched devices

### 3. Pull-to-Refresh
- **Hook**: `usePullToRefresh.tsx`
- **Component**: `PullToRefreshIndicator.tsx`
- **Enabled on**:
  - Feed (Cafeteria)
  - Receipts
  - Detention Board (Issues)
- **Features**:
  - Native-like pull gesture (80px threshold)
  - Visual indicator with rotation and color change
  - Smooth animations
  - Only active on mobile devices
  - Prevents overscroll on desktop

### 4. Safe Area Support
- **Implementation**: CSS environment variables
- **Areas protected**:
  - Top: Status bar / camera notch
  - Bottom: Home indicator / gesture bar
  - Sides: Rounded corners
- **Usage**:
  ```css
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
  ```

### 5. Touch Optimizations
- **Tap Highlights**: Custom orange highlight color
- **Minimum Touch Targets**: 44pt (Apple HIG) / 48dp (Material)
- **Active States**: Scale-down feedback on press
- **Smooth Scrolling**: `-webkit-overflow-scrolling: touch`

### 6. Mobile Composer
- **Sticky Footer**: Appears when textarea is focused
- **Character Counter**: Always visible on mobile
- **Safe-area Aware**: Respects home indicator
- **Expandable Textarea**: Grows on focus

### 7. Responsive Typography
- **Mobile-optimized**: Better readability on small screens
- **Proper line heights**: Comfortable reading
- **Reduced motion**: Respects `prefers-reduced-motion`

## CSS Utilities

### Safe Area Classes
```css
.safe-area-bottom  /* Adds bottom safe area padding */
.safe-area-top     /* Adds top safe area padding */
.mobile-nav-padding /* Adds padding for bottom nav */
```

### Mobile-First Media Queries
- Smooth scrolling enabled below 768px
- Touch-specific tap highlights
- Overscroll behavior prevention on desktop

## Accessibility

### Keyboard Navigation
- Tab to navigate between items
- Arrow keys in bottom nav
- Escape to close drawer
- Focus indicators on all interactive elements

### ARIA Support
- `aria-label` on all buttons
- `aria-current="page"` for active nav items
- `aria-expanded` for drawer state
- Proper semantic HTML

### Touch Targets
- All interactive elements ≥44pt/48dp
- Sufficient spacing between elements
- Clear active/focus states

## Performance

### Optimizations
- Lazy loading for images
- Conditional rendering (mobile vs desktop)
- Smooth 60fps animations
- Efficient touch event handlers
- Passive event listeners where possible

### Reduced Motion
All animations respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Browser Support
- iOS Safari 13+
- Chrome Mobile 90+
- Samsung Internet 14+
- Firefox Mobile 90+

## Testing Checklist
- [ ] Bottom nav displays on mobile, hidden on desktop
- [ ] Drawer opens/closes smoothly
- [ ] Pull-to-refresh works on all list views
- [ ] Safe areas respected on notched devices
- [ ] Tap targets are ≥44pt
- [ ] Keyboard navigation works
- [ ] Reduced motion is respected
- [ ] Works in landscape orientation
- [ ] Touch feedback is responsive

## Future Enhancements
- Swipe gestures for navigation
- Haptic feedback (requires Capacitor)
- Offline support with service workers
- Install prompt (PWA)
- Native share API integration
