# 🎬 CINETTER — Design System & Visual Bible v2.0
### Single Source of Truth for All Frontend Development
---

## 1. BRAND IDENTITY

### 1.1 Philosophy
Cinetter fuses **cinema culture** with **social interaction** — a kinetic, editorial platform that feels
like a premium film magazine brought to life digitally. Inspired by SUPERDRY's kinetic design language:
bold, black, high-contrast, typographically dominant, with electric orange accents that pulse with energy.

### 1.2 Logo
- **Mark**: A vinyl-record circle with film-strip negative space cutout + angular speech bubble tail
- **Wordmark**: "CINETTER" in Space Grotesk Black, letter-spaced at +0.05em, all caps
- **Favicon**: The mark alone, 32×32 and 16×16 variants
- **Color**: Matte white on pure black ONLY — no exceptions
- **Clear space**: Minimum 16px on all sides

### 1.3 Tagline
*"Feel the Pulse of Cinema"*

---

## 2. COLOR SYSTEM

### 2.1 Core Palette
```css
--color-black:          #000000;   /* Primary background — ABSOLUTE black */
--color-surface:        #0A0A0A;   /* Cards, panels, elevated surfaces */
--color-surface-hover:  #141414;   /* Hover states on surfaces */
--color-surface-active: #1A1A1A;   /* Active/pressed states */
--color-border:         #1E1E1E;   /* Subtle dividers */
--color-border-hover:   #2A2A2A;   /* Border hover states */

--color-orange:         #FF4D00;   /* PRIMARY ACCENT — Electric Orange */
--color-orange-hover:   #FF6A2E;   /* Hover state */
--color-orange-muted:   rgba(255, 77, 0, 0.2);  /* Glow backgrounds */
--color-orange-glow:    rgba(255, 77, 0, 0.08);  /* Ambient glow */

--color-white:          #FFFFFF;   /* Primary text */
--color-gray-100:       #E5E5E5;   /* Secondary text */
--color-gray-200:       #A3A3A3;   /* Tertiary text / placeholders */
--color-gray-300:       #737373;   /* Disabled text */
--color-gray-400:       #404040;   /* Very subtle elements */
```

### 2.2 CinePulse Category Colors
```css
--cinepulse-drop:       #EF4444;   /* Red — terrible, skip it */
--cinepulse-chill:      #F59E0B;   /* Amber — casual watch */
--cinepulse-engage:     #10B981;   /* Emerald — engaging, worth it */
--cinepulse-master:     #A855F7;   /* Purple — masterpiece */
```

### 2.3 Semantic Colors
```css
--color-success: #22C55E;
--color-warning: #EAB308;
--color-error:   #EF4444;
--color-info:    #3B82F6;
```

### 2.4 Gradient Tokens
```css
--gradient-hero:        linear-gradient(135deg, #FF4D00 0%, #FF0080 50%, #7928CA 100%);
--gradient-cinepulse:   conic-gradient(from 180deg, #EF4444, #F59E0B, #10B981, #A855F7);
--gradient-card-overlay: linear-gradient(to top, #000 0%, transparent 60%);
--gradient-apple-ai:    conic-gradient(from var(--angle), #FF4D00, #FF0080, #7928CA, #3B82F6, #10B981, #FF4D00);
```

---

## 3. TYPOGRAPHY

### 3.1 Font Stack
```css
--font-display: 'Space Grotesk', sans-serif;   /* Headlines, hero, brand */
--font-body:    'Inter', sans-serif;            /* Body, UI elements */
--font-mono:    'JetBrains Mono', monospace;    /* Stats, scores, data */
```

### 3.2 Type Scale
```
Hero:     clamp(3rem, 8vw, 7rem)    / lh 0.95 / ls -0.03em / fw 800
H1:       clamp(2rem, 4vw, 3.5rem) / lh 1.1  / ls -0.02em / fw 700
H2:       clamp(1.5rem, 3vw, 2.25rem) / lh 1.2 / ls -0.01em / fw 700
H3:       1.5rem / lh 1.3 / ls -0.01em / fw 600
H4:       1.25rem / lh 1.4 / fw 600
Body:     1rem / lh 1.6 / fw 400
Body-sm:  0.875rem / lh 1.5 / fw 400
Caption:  0.75rem / lh 1.4 / ls 0.02em / fw 500
Overline: 0.6875rem / lh 1.2 / ls 0.1em / fw 700 / UPPERCASE
```

---

## 4. SPACING & LAYOUT

### 4.1 8px Base Spacing Scale
```
space-1: 4px  | space-2: 8px   | space-3: 12px | space-4: 16px
space-5: 20px | space-6: 24px  | space-8: 32px | space-10: 40px
space-12: 48px | space-16: 64px | space-20: 80px | space-24: 96px
```

### 4.2 Container & Grid
```
Container max-width: 1440px
Container padding: clamp(1rem, 4vw, 4rem)
Grid: 12 columns, 1.5rem gap
Sidebar: 4 cols (right), Main: 8 cols
```

### 4.3 Breakpoints
```
sm: 640px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1536px
```

### 4.4 Border Radius
```
sm: 6px | md: 8px | lg: 12px | xl: 16px | 2xl: 24px | full: 9999px
```

---

## 5. THE 15 MODERN COMPONENTS — FULL SPECIFICATION

### ⬡ Component 1: DYNAMIC ISLAND
**What**: Pill-shaped notification hub that expands/contracts to show context
**Where**: Fixed top-center of viewport (above navbar), z-60
**Use Cases on Cinetter**:
- Real-time "🔥 [User] just voted Masterpiece on [Movie]"
- "✅ Added to Watchlist" confirmation
- Socket.io incoming notification previews
- CinePulse score update alerts

**Implementation**:
```jsx
// Framer Motion layout animation + clip-path
// Base: 120x36px pill
// Expanded: 360x80px rounded rectangle with content
<motion.div
  layout
  style={{ borderRadius: 100 }}  // keeps pill shape during layout animation
  className="dynamic-island"
>
  <AnimatePresence mode="wait">
    {content}
  </AnimatePresence>
</motion.div>
```
**Design**: Pure black background, white text, orange accent dot, backdrop-blur
**Trigger**: Socket.io events → island expands → auto-collapses after 4s

---

### ⬡ Component 2: PARALLAX
**What**: Layered scroll-speed differentiation for depth
**Where**:
1. **Movie Detail Hero**: Backdrop image scrolls at 0.4x speed, fades
2. **Landing Page**: Floating poster grid at different parallax depths (0.2x / 0.5x / 0.8x)
3. **Person Detail Page**: Hero gradient background parallax

**Implementation**:
```jsx
// Framer Motion useScroll + useTransform
const { scrollY } = useScroll();
const y = useTransform(scrollY, [0, 500], [0, -200]);  // 0.4x parallax
const opacity = useTransform(scrollY, [0, 300], [1, 0]);

<motion.div style={{ y, opacity }} className="hero-backdrop" />
```
**Performance**: `will-change: transform` on parallax elements, passive scroll listeners

---

### ⬡ Component 3: INFINITE CANVAS
**What**: Infinite, pannable, zoomable grid of movie posters
**Where**: Landing page hero background (unauthenticated) + optional "Browse All" mode
**Implementation**:
```jsx
// CSS transform translate + mouse tracking
// Posters in a grid far larger than viewport
// Auto-pan animation (slow drift) when idle
// Mouse-drag to pan when interactive
const handleMouseMove = (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 40;  // ±20px drift
  const y = (e.clientY / window.innerHeight - 0.5) * 40;
  setOffset({ x, y });
};
```
**Visual**: Movie posters at varied opacities (0.4–0.9), slight rotation offsets, blur on edges

---

### ⬡ Component 4: APPLE FEATURE BLOCK
**What**: Scroll-pinned bento-style feature showcase
**Where**: Landing page "Why Cinetter?" section (between hero and auth CTA)
**Blocks**:
1. CinePulse meter demo (live animated)
2. AI Mood Engine preview (emoji grid)
3. Real-time vote counter (Socket.io live demo)
4. Watch Party teaser (split screen)

**Implementation**:
```jsx
// Sticky scroll container
// Each panel fades in/out as user scrolls through pinned section
// useScroll with scrollYProgress mapped to panel visibility
<div className="sticky top-0 h-screen overflow-hidden">
  {panels.map((panel, i) => (
    <motion.div
      style={{ opacity: useTransform(progress, [i/n, (i+1)/n], [0, 1]) }}
    />
  ))}
</div>
```

---

### ⬡ Component 5: SMOOTH EXPANDABLE TABS NAVIGATION
**What**: Tab bar where active tab smoothly expands to show label alongside icon
**Where**:
1. **Movie detail page** — Overview | CinePulse | Reviews | Cast | Similar
2. **Collections** — Discover | My Collections | Saved
3. **Profile** — Reviews | Collections

**Implementation**:
```jsx
// Framer Motion layout + AnimatePresence
<motion.button layout className="tab">
  <Icon />
  <AnimatePresence>
    {isActive && (
      <motion.span
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 'auto' }}
        exit={{ opacity: 0, width: 0 }}
      >
        {label}
      </motion.span>
    )}
  </AnimatePresence>
</motion.button>
```
**Active tab**: Orange underline indicator that slides via `layoutId="tab-indicator"`

---

### ⬡ Component 6: ROLLING TEXT
**What**: Continuously scrolling text marquee
**Where**:
1. **Navbar top strip** — "🔥 Trending: Dune: Part Three · Avengers: Doomsday · The Pitt..."
2. **Landing page** — Genre tags rolling strip
3. **CinePulse section** — Category labels scrolling

**Implementation**:
```css
/* CSS Marquee with pause-on-hover */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-track {
  animation: marquee 30s linear infinite;
  display: flex;
  width: max-content;
}
.marquee-track:hover { animation-play-state: paused; }
```
**Content**: Two copies of content side-by-side for seamless loop

---

### ⬡ Component 7: ANIMATED ICONS
**What**: Icons that animate on hover/interaction (not static)
**Where**: Throughout — navbar icons, action buttons, CinePulse vote pills, social interactions

**Specific animations**:
- **Bookmark icon**: Fills/unfills on watchlist toggle (Framer Motion path drawing)
- **Heart icon**: Springy bounce scale (1→1.4→0.9→1) + fill color transition
- **Search icon**: Rotates 90° then morphs into X when overlay opens
- **Bell icon**: Wobbles left-right 3° when notification arrives
- **Fire icon**: Flickers with scale oscillation on "Interested" count

**Implementation**:
```jsx
// SVG path animation via Framer Motion
<motion.path
  initial={{ pathLength: 0, fill: 'none' }}
  animate={{ pathLength: 1, fill: isActive ? '#FF4D00' : 'none' }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
  d={bookmarkPath}
/>
```

---

### ⬡ Component 8: APPLE AI GRADIENT
**What**: The rotating multi-color conic gradient glow used by Apple for AI features
**Where**:
1. **CinePulse meter** outer ring glow (animated when score is very high/low)
2. **AI Mood Engine FAB** pulsing glow
3. **Director's Chair / CineRoast** loading state
4. **Taste DNA** fingerprint visualization background

**Implementation**:
```css
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes rotate-gradient {
  to { --angle: 360deg; }
}

.apple-ai-glow {
  background: conic-gradient(
    from var(--angle),
    #FF4D00, #FF0080, #7928CA, #3B82F6, #10B981, #FF4D00
  );
  animation: rotate-gradient 3s linear infinite;
  border-radius: 50%;
  padding: 2px;  /* creates the glow border effect */
}
```

---

### ⬡ Component 9: ANIMATED INPUT TEXT
**What**: Placeholder text that cycles through suggestions with a typing/erasing animation
**Where**:
1. **Vercel Command Search** palette — "Search movies, people, collections..."
2. **AI Mood Engine NLP input** — cycles through: "Something like Inception...", "A feel-good romance...", "Mind-bending sci-fi..."
3. **Main search bar** — types out trending movie names

**Implementation**:
```jsx
const placeholders = ['A movie like Inception...', 'Something dark and gritty...', 'Feel-good comedy tonight...'];
// State machine: typing → pause → erasing → next phrase
// useEffect with setInterval for character-by-character animation
// Framer Motion cursor blink at end of typed text
```

---

### ⬡ Component 10: EXPAND HOVER EFFECT
**What**: Cards/elements expand on hover revealing hidden content
**Where**:
1. **Movie cards on Explore** — hover reveals CinePulse score, watchlist button, quick rating
2. **Collection cards** — hover reveals item list preview
3. **Review cards** — hover reveals full text (if truncated)
4. **Cast member cards** — hover expands to show filmography snippet

**Implementation**:
```jsx
<motion.div
  whileHover={{ scale: 1.04 }}
  className="movie-card group"
>
  {/* Always visible: poster image */}
  <img src={poster} />
  
  {/* Hidden overlay — reveals on hover */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileHover={{ opacity: 1, y: 0 }}
    className="card-overlay"
  >
    <CinePulseBadge score={score} />
    <WatchlistButton />
    <VoteRow />
  </motion.div>
</motion.div>
```

---

### ⬡ Component 11: APPLE NAVBAR OPENING EFFECT
**What**: Navigation pill indicator that slides smoothly between items using shared layoutId
**Where**: **Main top navbar** — the active section indicator

**Implementation**:
```jsx
// The "magic" — one shared layoutId that moves between items
{navItems.map(item => (
  <button key={item.id} onClick={() => setActive(item.id)}>
    {active === item.id && (
      <motion.div
        layoutId="nav-pill"
        className="nav-active-bg"
        style={{ borderRadius: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
    )}
    <item.Icon />
    <span>{item.label}</span>
  </button>
))}
```
**Extension**: Mobile bottom navbar uses the same effect horizontally

---

### ⬡ Component 12: CARD STACK SCROLL
**What**: Cards stack and peel away as you scroll, like a deck being flipped
**Where**:
1. **Landing page feature showcase** — Feature cards stack/peel
2. **Admin dashboard** — Stats cards stack on mobile
3. **Watch Party room** — Participant cards in stacked view

**Implementation**:
```jsx
// Each card has a sticky position with increasing top offset
// useScroll + useTransform for scale and y transforms
// Card i: scale = 1 - (i * 0.04) at rest, normalizes as scroll progresses
{cards.map((card, i) => (
  <motion.div
    key={i}
    style={{
      scale: useTransform(scrollYProgress, [i/n, (i+1)/n], [1, 0.95]),
      y: useTransform(scrollYProgress, [i/n, (i+1)/n], [0, -20]),
      zIndex: cards.length - i,
    }}
    className="sticky top-24"
  >
    {card}
  </motion.div>
))}
```

---

### ⬡ Component 13: VERCEL TOOLTIP
**What**: Floating tooltip that appears on hover with smooth scale-up animation
**Where**: Everywhere that needs contextual info without cluttering UI
- Nav icon tooltips
- CinePulse category labels on hover
- Vote count breakdowns
- Feature flag status indicators in admin

**Implementation**:
```jsx
<div className="relative group">
  <button>{triggerElement}</button>
  <motion.div
    initial={{ opacity: 0, scale: 0.85, y: 4 }}
    whileHover={{ opacity: 1, scale: 1, y: 0 }}
    // Use CSS group-hover for trigger instead of JS for perf
    className="tooltip"
    style={{ transformOrigin: 'top center' }}
  >
    {content}
    <div className="tooltip-arrow" />
  </motion.div>
</div>
```
**Style**: Dark #1A1A1A bg, white text, 1px border, subtle drop shadow, 6px border-radius

---

### ⬡ Component 14: VERCEL COMMAND SEARCH (CMD+K)
**What**: Full command palette overlay — search movies, people, collections, navigate
**Where**: Global — triggered by `Cmd/Ctrl+K` or Search icon click

**Features**:
- Fuzzy search across movies, shows, people, collections
- Keyboard navigation (↑↓ to navigate, Enter to select, Esc to close)
- Recent searches stored locally
- Quick actions: "Go to Watchlist", "Open Settings", "Toggle Dark Mode"
- Animated typing placeholder cycling (connects to Component 9)
- Results grouped by category with section headers

**Implementation**:
```jsx
// Global keydown listener for Cmd+K
// Framer Motion AnimatePresence for overlay fade
// Backdrop blur background
// Input with animated placeholder (Component 9)
// Virtualized result list for performance
useEffect(() => {
  const handler = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(true);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

---

### ⬡ Component 15: COOL CAROUSELS
**What**: Multiple carousel variants for different content types
**Where**: Throughout the entire platform

**Variant A — Momentum Drag Carousel** (Explore page movie rows):
```jsx
// Framer Motion drag with elastic constraints
<motion.div
  drag="x"
  dragConstraints={{ left: -maxScroll, right: 0 }}
  dragElastic={0.1}
  className="carousel-track"
>
  {items}
</motion.div>
```

**Variant B — Auto-scroll Carousel** (Landing page poster showcase):
- CSS `scroll-behavior: smooth` + JS auto-advance
- Pause on hover, resume on leave

**Variant C — Coverflow 3D Carousel** (Movie spotlight / featured picks):
```jsx
// Each card gets rotateY transform based on distance from center
// Center card: scale 1.1, rotateY 0
// Adjacent: scale 0.85, rotateY ±25deg
// Far cards: scale 0.7, rotateY ±45deg, opacity 0.5
```

**Variant D — Scroll-snap Carousel** (Mobile movie rows):
```css
.carousel { scroll-snap-type: x mandatory; overflow-x: scroll; }
.carousel-item { scroll-snap-align: start; }
```

---

## 6. STANDARD COMPONENT SPECIFICATIONS

### 6.1 Navigation Bar
- Fixed top, 72px desktop / 64px mobile
- `rgba(0,0,0,0.85)` + `backdrop-blur(20px)` + 1px bottom border
- Logo left, nav center, profile/search right
- **Uses Component 11** (Apple navbar opening effect)
- **Uses Component 13** (Vercel tooltips on icon hover)
- Mobile: Bottom tab bar, frosted glass

### 6.2 Movie Card
- Aspect ratio 2:3 (poster)
- **Uses Component 10** (Expand hover effect for actions overlay)
- **Uses Component 7** (Animated bookmark/heart icons)
- Skeleton shimmer loading state
- CinePulse mini badge (top-right, animated in on hover)

### 6.3 CinePulse Meter
- SVG semi-circular arc gauge (180°)
- **Uses Component 8** (Apple AI gradient on outer ring glow)
- Counter animates 0 → score (1.2s ease-out)
- Donut chart for category distribution

### 6.4 Review Cards
- Avatar + username + date + category badge
- Expandable text, spoiler toggle
- Like/reply/more actions with **Component 7** (animated icons)
- **Uses Component 13** (tooltip on vote counts)

### 6.5 Mood Engine Panel
- FAB: **Component 8** pulsing AI gradient glow
- Slide-up: `AnimatePresence` slideUp preset
- Input: **Component 9** animated placeholder
- Results: **Component 15 Variant A** momentum carousel

---

## 7. ANIMATION PRESETS (Framer Motion)

```js
export const animations = {
  pageEnter:    { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } },
  pageExit:     { exit: { opacity: 0, y: -20 }, transition: { duration: 0.3 } },
  stagger:      { variants: { container: { transition: { staggerChildren: 0.06 } } } },
  cardHover:    { whileHover: { scale: 1.03 }, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  scrollReveal: { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6, ease: 'easeOut' } },
  slideUp:      { initial: { y: '100%' }, animate: { y: 0 }, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } },
  springBounce: { transition: { type: 'spring', stiffness: 500, damping: 15 } },
};
```

---

## 8. PAGE LAYOUTS WITH COMPONENT MAP

### 8.1 Landing Page (Unauthenticated)
- **Component 3**: Infinite canvas floating poster background
- **Component 4**: Apple feature block scroll section
- **Component 6**: Rolling text genre strip
- **Component 15B**: Auto-scroll carousel spotlight
- Logo centered, animated typewriter hero tagline
- CTA: Login (orange filled) + Sign Up (outlined)

### 8.2 Explore (Authenticated Home)
- **Component 1**: Dynamic Island notifications (top-center)
- **Component 11**: Navbar active pill indicator
- **Component 15A**: Momentum drag carousels for each movie row
- **Component 10**: Expand hover on all movie cards
- **Component 6**: Rolling trending strip below navbar
- Sidebar: "Most Interested" ranked list

### 8.3 Movie Detail Page
- **Component 2**: Parallax hero backdrop
- **Component 5**: Expandable tabs (Overview|CinePulse|Reviews|Cast|Similar)
- **Component 8**: Apple AI gradient on CinePulse meter border
- **Component 7**: Animated icons (bookmark, heart)
- **Component 15C**: Coverflow carousel for Similar Movies
- **Component 13**: Tooltips on vote breakdown stats

### 8.4 Schedule Page
- **Component 5**: Expandable tabs (Today|Upcoming|Announced)
- **Component 10**: Hover expand on movie cards
- **Component 15A**: Draggable rows for each year

### 8.5 Spaces (Social Feed)
- **Component 7**: Animated like/share icons
- **Component 13**: Tooltips on topic badges
- **Component 6**: Rolling news headlines strip

### 8.6 Vercel Command Search (Global)
- **Component 14**: Cmd+K command palette
- **Component 9**: Animated placeholder cycling
- **Component 13**: Result item tooltips

### 8.7 Admin Dashboard
- **Component 12**: Card stack scroll for mobile stats
- **Component 13**: Tooltips on chart data points
- **Component 7**: Animated status icons

### 8.8 Auth Pages
- **Component 3**: Subtle infinite canvas poster background (blurred)
- **Component 9**: Animated placeholder in email/password fields

---

## 9. PRELOADER

```
Animation sequence (2s total, skippable after 1s):
1. 0.0–0.4s: Logo mark fades in + slight scale up (0.8 → 1)
2. 0.4–0.8s: Film reel portion animates (SVG path draw)
3. 0.8–1.4s: "CINETTER" wordmark types in letter by letter
4. 1.4–1.8s: Tagline fades in below
5. 1.8–2.0s: Entire preloader fades out, page slides up
```
Route transitions: 3px orange top progress bar (nprogress-style)

---

## 10. ICONOGRAPHY
- **Library**: Lucide React — consistent, tree-shakable
- **Sizes**: 16px inline, 20px default, 24px navigation
- **Stroke**: 1.5px weight
- **Active state**: Orange fill/color
- All animated via **Component 7**

---

## 11. ACCESSIBILITY & PERFORMANCE

### Accessibility (WCAG 2.1 AA)
- 4.5:1 contrast ratio for all text
- 2px orange focus ring, 2px offset
- Full keyboard navigation (tab order, arrow keys for carousels)
- `prefers-reduced-motion`: All Components 2,3,4,6,8 disabled / simplified
- ARIA labels on all custom interactive components
- Screen reader announcements for Dynamic Island (Component 1) via aria-live

### Performance Rules
- All animations use `transform` + `opacity` only (GPU-accelerated)
- `will-change: transform` only on actively animating elements
- Framer Motion `useReducedMotion()` hook checked globally
- Route code splitting: `React.lazy()` per page
- Images: WebP + responsive srcset + Intersection Observer lazy load
- Carousel: Only render visible + 2 adjacent items (virtualization)
- LCP < 2.5s | FID < 100ms | CLS < 0.1

---

## 12. DARK MODE ONLY
Cinetter is dark-mode-only by design:
- Movie posters are the visual heroes — black makes colors pop
- Reduces eye strain for late-night peak-usage hours
- Aligns with cinema/theater ambiance
- Enables richer use of colored lighting effects and glows

---

*Version 2.0 — April 2026 | This document is the single authoritative design reference.*
