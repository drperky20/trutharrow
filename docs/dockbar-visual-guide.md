# DockBar Visual Guide

## Layout Comparison

### Mobile (≤ 768px)
```
┌─────────────────────────────┐
│                             │
│   Content Area              │
│   (with ta-pb-dock padding) │
│                             │
│                             │
└─────────────────────────────┘
╔═════════════════════════════╗
║ [🏠] [📋] [💬] [🧾] [📤] [👤] ║  ← Full-width bar
║ Home Deten Cafe Rcpt Sub Pro ║     Rounded top
╚═════════════════════════════╝     Translucent bg
        88px + safe-area
```

### Desktop (≥ 768px)
```
┌─────────────────────────────┐
│                             │
│   Content Area              │
│   (no bottom padding)       │
│                             │
│                             │
│                             │
│      ╔═══════════════╗      │
│      ║ [🏠] [📋] [💬] ║      │  ← Centered floating dock
│      ║ [🧾] [📤] [👤] ║         Pill shape
│      ╚═══════════════╝         Glassy shadow
│                             │
└─────────────────────────────┘
         Centered dock
```

## Button States

### Resting State
```
┌──────────┐
│ ╔══════╗ │  ← Gradient fill
│ ║  🏠  ║ │     Outer shadow
│ ║      ║ │     Inner highlight
│ ╚══════╝ │
│  Label   │
└──────────┘
```

### Hover (Desktop Only)
```
┌──────────┐
│ ╔══════╗ │  ← Lifts -1px
│ ║  🏠  ║ │     Larger shadow
│ ║      ║ │     Subtle glow
│ ╚══════╝ │
│  Label   │
└──────────┘
    ↑ -1px
```

### Pressed/Active
```
┌──────────┐
│ ╔══════╗ │  ← Presses +1px
│ ║  🏠  ║ │     Inset shadow
│ ║      ║ │     Darker gradient
│ ╚══════╝ │
│  Label   │
└──────────┘
    ↓ +1px
```

## Icon Grid

All icons are **filled** with subtle bevels:

```
┌─────────────────────────────────────────┐
│                                         │
│  🏠 HomeFilled        📋 DetentionFilled │
│  House with roof     Clipboard/page     │
│                                         │
│  💬 CafeteriaFilled   🧾 ReceiptsFilled  │
│  Chat bubble         Receipt with $     │
│                                         │
│  📤 SubmitFilled      🛡️ AdminShieldFilled│
│  Arrow up in tray    Shield with check  │
│                                         │
│  👤 UserFilled                           │
│  Bust silhouette                        │
│                                         │
└─────────────────────────────────────────┘
```

## Profile Dropdown (Desktop)

```
┌──────────┐
│  👤      │
│  Austin  │ ← Click opens menu
└──────────┘
     │
     └─→ ┌────────────────────┐
         │ austin@email.com   │ ← Email (disabled)
         ├────────────────────┤
         │ Submit Post        │ ← Quick action
         ├────────────────────┤
         │ Sign Out (red)     │ ← Logout
         └────────────────────┘
```

## Color Palette

### Light Mode
```
Background:     rgba(255,255,255, 0.8)   Translucent white
Border:         rgba(255,255,255, 0.5)   Subtle outline
Button Grad:    #ffffff → #e6e9f4        Soft gradient
Shadow:         rgba(0,0,0, 0.25)        Depth shadow
Icon Color:     #1b1b1b                  Near-black
```

### Dark Mode
```
Background:     rgba(26,26,26, 0.9)      Translucent dark
Border:         rgba(255,255,255, 0.1)   Minimal outline
Button Grad:    #1a1a1a → #121212        Dark gradient
Shadow:         rgba(0,0,0, 0.6)         Deep shadow
Icon Color:     rgba(255,255,255, 0.95)  Off-white
```

## Spacing & Sizing

### Mobile
```
Touch Target:   44px × 44px (minimum)
Icon Size:      20-24px (clamp based on viewport)
Label Size:     10px
Grid Columns:   6-7 equal columns
Padding:        12px horizontal, 8px vertical
Border Radius:  24px (top corners only)
```

### Desktop
```
Touch Target:   56px × 56px
Icon Size:      26-28px
Label Size:     12px
Gap Between:    8px
Padding:        16px horizontal, 12px vertical
Border Radius:  16px (all corners)
```

## Animation Timeline

### Button Press
```
Time:   0ms ────────────► 150ms
State:  Rest ──► Hover ──► Pressed
        │        │         │
Shadow: Standard  Large    Inset
Y-pos:  0        -1px     +1px
```

### Route Change
```
Old Button:  Active ────► Rest
              ▼
             150ms transition
              ▼
New Button:  Rest ──────► Active
```

## Safe Area Padding

### iPhone with Notch
```
┌─────────────────────┐
│  ▓▓▓ Status Bar ▓▓▓ │ ← Top notch (handled by meta tag)
│                     │
│   Content Area      │
│                     │
│                     │
╔═════════════════════╗
║   Dock Items        ║ ← 88px base
║                     ║
╚═════════════════════╝
 ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ← + safe-area-inset-bottom (34px)
```

### Standard iPhone
```
┌─────────────────────┐
│   Status Bar        │
│                     │
│   Content Area      │
│                     │
│                     │
╔═════════════════════╗
║   Dock Items        ║ ← 88px base
╚═════════════════════╝
 ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ← + safe-area (10px minimum)
```

## Z-Index Stack

```
Layer 50: SmartLogo (avoids dock)
Layer 40: DockBar ←────────────── Main navigation
Layer 20: Modals & Dropdowns
Layer 10: Sticky headers
Layer  1: Content
Layer  0: Background
```

## Responsive Breakpoints

```
xs:  0px - 639px    │ Full-width bar, tiny labels
sm:  640px - 767px  │ Full-width bar, small labels
md:  768px+         │ Floating dock, full labels
lg:  1024px+        │ Same as md, more spacing
```

## Admin Conditional Display

```
Regular User (6 items):
[🏠] [📋] [💬] [🧾] [📤] [👤]

Admin User (7 items):
[🏠] [📋] [💬] [🧾] [📤] [🛡️] [👤]
                      ↑
                    Added
```

## Accessibility Features

### Screen Reader Experience
```
<nav aria-label="Primary navigation">
  <Link to="/" aria-current="page">
    <Icon aria-hidden="true" />
    <span>Front Office</span>
  </Link>
  ...
</nav>
```

### Keyboard Navigation
```
Tab Order: Home → Detention → Cafeteria → Receipts → Submit → [Admin] → Profile
           │       │           │            │          │                  │
           └─────> Focus Ring (2px primary color, 2px offset) ───────────┘
```

### Focus States
```
Default:    No outline
Tab Focus:  ╔═══════╗  ← 2px ring
            ║  🏠   ║     Primary color
            ╚═══════╝     2px offset
```

## Implementation Checklist

Visual Polish:
- [x] Gradient backgrounds with multi-layer shadows
- [x] Translucent backdrop blur
- [x] Smooth transitions (150ms ease)
- [x] Hover lift on desktop (-1px)
- [x] Press effect (+1px with inset shadow)
- [x] Icon sizing with clamp() for fluid scaling

Responsive:
- [x] Mobile: Full-width bar, rounded top
- [x] Desktop: Centered floating dock
- [x] Tablet: Adaptive layout
- [x] Safe-area support for iOS

Interaction:
- [x] Active route indication
- [x] Profile dropdown with auth
- [x] Conditional admin access
- [x] Touch-friendly 44px targets

Accessibility:
- [x] Semantic HTML with nav role
- [x] Aria labels and current page
- [x] Keyboard navigation
- [x] Focus indicators
- [x] Reduced motion support

Integration:
- [x] SmartLogo avoidance
- [x] Content padding
- [x] Route detection
- [x] Auth state management

