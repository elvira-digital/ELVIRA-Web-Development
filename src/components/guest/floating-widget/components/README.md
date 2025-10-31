# Floating Widget Components

This subfolder contains the individual components used in the floating widget menu.

## Structure

```
components/
├── FloatingBellButton.tsx    # Main bell toggle button (bigger, shakes on touch)
├── FloatingActionButton.tsx  # Individual action buttons (clock, message)
└── index.ts                  # Barrel export
```

## Components

### FloatingBellButton

- **Size**: `w-8 h-8` (bigger than action buttons)
- **Behavior**: Shakes on every touch/click
- **Features**:
  - Notification badge with red dot indicator
  - Automatic shake animation when `shouldShake` prop changes
  - Manual shake trigger on click
  - Hover scale effect

### FloatingActionButton

- **Size**: `w-6 h-6` (standard size for action buttons)
- **Behavior**: Staggered slide-in animation when menu opens
- **Features**:
  - Badge counter for notifications
  - Tooltip on hover
  - Shake animation support
  - Customizable background color

## Usage

```tsx
import { FloatingBellButton, FloatingActionButton } from './components';

// Bell button - bigger and shakes
<FloatingBellButton
  isOpen={isOpen}
  onClick={handleToggle}
  shouldShake={shouldShakeBell}
  notificationCount={count}
/>

// Action buttons - smaller
<FloatingActionButton
  icon={Clock}
  label="Room Service"
  onClick={handleClick}
  bgColor="bg-purple-500"
  index={0}
  isVisible={isOpen}
/>
```

## Design Decisions

1. **Bell is Bigger**: The bell icon is `w-8 h-8` while action buttons are `w-6 h-6` to emphasize it as the main toggle button
2. **Shake on Touch**: The bell shakes every time it's clicked/touched for tactile feedback
3. **Automatic Shake**: The bell also shakes when `shouldShake` prop changes (e.g., new notification)
4. **Modular Structure**: Components separated into subfolder for better organization and maintainability
