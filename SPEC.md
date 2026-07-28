# SPEC.md — "Oat & Mill" Ice-Cream App (Expo + React Native + TypeScript)

Pixel-perfect recreation of the provided 3-screen reference design. Premium, Awwwards-grade motion.
Project root: `/mnt/agents/output/icecream-app/`

## 1. Tech Stack (upgraded 2026-07)
- Expo SDK 57 (managed, CNG), React Native 0.86, React 19, TypeScript strict
- react-native-reanimated v4 + react-native-worklets, react-native-gesture-handler, react-native-svg, expo-blur, expo-router (file-based navigation in `app/`), react-native-safe-area-context
- CSS `experimental_backgroundImage` gradients (expo-linear-gradient removed); React Compiler enabled via app.json experiments
- No placeholder images. Product assets already exist at `src/assets/generated-products/`:
  `chocolate.png`, `rocky-road.png`, `vanilla.png`, `mint-chocolate.png`, `strawberry.png`, `dessert-cup.png`, `avatar.png` (all 1024×1024 transparent PNG, front-facing, upright — runtime transforms only).

## 2. Design System (extracted from reference — single source of truth)

### Colors (`src/theme/colors.ts`)
- App background: warm off-white pearl gradient. Base `#F5EDED` → `#FBEAE0` (top-left light) with soft blush patches; use `AppBackground` component: LinearGradient (colors `#F8F0EC` → `#F3E4DE` → `#FBEFE6`, start {0,0} end {1,1}) + 2 decorative translucent blurred circles (`#FFFFFF` @ 0.5 opacity, blur) top-left (~ -60,-60, ∅260) and mid-right.
- `text` (near-black plum): `#22120F`
- `textMuted`: `#8E7B78`
- `burgundy` (primary dark / cart container / Add button): `#6B0F2E` (deep wine; gradient `#7A1233` → `#5A0B26`)
- `burgundyDark`: `#4F0A20`
- `cardPink` (home product card bg): soft pink glass — base `#FBE0E6` translucent over white, highlight `#FFF5F7`
- `chipActiveBg`: `#FBE4EA` with subtle border `#F3CFD8`; chip inactive: transparent w/ muted text
- `cream` (price pill bg on detail, badge): `#FFE3B3` / `#FFD9A0`
- `summaryPink` (cart summary card): `#FDE0DC` → `#FCD2CE` gradient
- `white`: `#FFFFFF`
- price pill text on home card: `#22120F`

### Typography (`src/theme/typography.ts`)
Use system font stack that reads geometric-humanist: iOS `Avenir Next` / Android `sans-serif-medium`; abstract into `fonts.ts` with weights 400/500/600/700/800.
- Greeting "Better **Ice cream** better planet": 30px, lineHeight 36, mixed weight (regular + bold words), color `text`
- "Flavor of the week": 18px, weight 500
- Product name on card ("Rocky Road"): 34px, weight 800, two lines
- Subtitle pill text ("Fudge Brownie"): 14px, weight 500
- Price on card ("$ 12.00"): 18px, weight 800
- Detail title (header): 22px, weight 600, centered
- Quantity ("02"): 44px, weight 800
- Detail price pill ("$16.00"): 18px weight 700 on cream pill (h ~40, radius 20, px 24)
- "Add To Cart": 18px, weight 600, white
- Cart header "Cart": 24px weight 700; badge 16px weight 700 on cream circle ∅40
- Cart row name: 17px weight 600 white; subtitle: 13px weight 400 `#E9B8C4`-ish muted pink-white (use `rgba(255,255,255,0.55)`)
- Cart row price pill: 15px weight 600, text `#22120F`, bg `#FBE4EA`, pill h 36 px 16 radius 18
- Summary labels: 16px weight 500 `#22120F`; values 16px weight 700; "USD 38.00": 24px weight 800
- "Make Payment": 18px weight 700 `#22120F`
- Mini cart: "Cart" 17px weight 700 white; "2 Items" 13px `rgba(255,255,255,0.6)`

### Spacing / Radius / Metrics (`src/theme/metrics.ts`)
- Screen horizontal padding: 28 (home), 24 (detail), 24 (cart)
- Phone frame corner illusion: screens themselves use bg gradient; cards: product card radius 36; chips radius 24 (h 48); icon chips ∅52 circle; product card image overflows card right edge slightly (bleed) and is rotated ~ -18°
- Arrow button (→ next to Flavor of the week): 40px, thin arrow icon, right-aligned
- Floating cart FAB on product card: ∅64, burgundy, white cart icon, positioned bottom-right inside card (16 from edges), shadow
- Detail: qty controls row — "+" and "−" circular ghost buttons (∅56, transparent bg, 28px icon, color text) flanking big number; price pill centered below
- Add To Cart bar: height 72, radius 36, burgundy; left label centered-left; right inner cream circle ∅56 with burgundy cart icon; full width minus padding, marginBottom safe-area + 24
- Cart screen: burgundy container starts ~150px from top (below header), top corners radius 44, extends to bottom edge of screen; rows: thumbnail in translucent white circle ∅72 (`rgba(255,255,255,0.12)`), gap 20, padding 28/24
- Summary card: inset 24, radius 32, padding 24; wavy top & bottom edges with center notch (see §4); dessert illustration bottom-right ~120×120 overlapping edge
- Make Payment bar: height 76, radius 38, white bg; right cream circle ∅60 with "›››" chevrons icon (burgundy); margin 24, inside burgundy container bottom
- Divider in summary: 1px `rgba(34,18,15,0.12)`

## 3. Data (`src/constants/products.ts`)
```ts
export interface Product {
  id: string; name: string; subtitle: string; price: number;
  image: ImageSourcePropType;       // generated product png
  cardColors: { bg: string; accent: string }; // per-flavor card tint
}
```
1. Chocolate — "Peanut butter ripple" — $8.00 — chocolate.png
2. Turtle Crossing (Vanilla) — "Creamy vanilla" — $16.00 — vanilla.png  (detail screen opens on this one by default, matching reference)
3. Chocolate Chip (Mint Chocolate) — "Green peppermint" — $10.00 — mint-chocolate.png
4. Rocky Road — "Fudge Brownie" — $12.00 — rocky-road.png  (home featured card, matching reference)
5. Strawberry — "Sweet berry swirl" — $11.00 — strawberry.png

Cart store (`src/services/cartStore.tsx`): React 19 `use(CartContext)` + `<CartContext value>` provider + reducer. State: items `{productId, qty}[]`; actions add/remove/setQty/clear; derived totalCount, subtotal, deliveryCharge = 4.44, total. Pre-seed with Chocolate×1, Turtle Crossing×2, Chocolate Chip×1 so Cart screen matches reference ($38.00 total incl. $4.44 delivery... 8+32+10=50 → to match "USD 38.00" use quantities Chocolate×1, Turtle Crossing×1, Chocolate Chip×2 → 8+16+20=44... Final rule: quantities 1/1/1 → subtotal 34 + 4.44 = 38.44 ≈ display "USD 38.44"; simpler: seed 1× each and compute real total — reference badge shows 3 items.) Badge = totalCount.

## 4. Custom SVG Cart Shape (`src/components/CartShape/CartShape.tsx`) — CRITICAL
Reusable component drawing the signature container silhouette: rounded corners + **wavy top edge with a shallow concave notch at center** (inward cut), optional same treatment on bottom edge, and a **thin center divider line** option.
```tsx
interface CartShapeProps {
  width: number; height: number;
  notchDepth?: number;   // default 10
  notchWidth?: number;   // default 90
  cornerRadius?: number; // default 36
  wave?: boolean;        // gentle S-curve across top edge, default true
  bottomNotch?: boolean; // default false (true for summary card)
  divider?: boolean;     // draws 1px horizontal divider at dividerY
  dividerY?: number;
  fill?: string; colors?: string[]; // solid or LinearGradient
  children?: React.ReactNode; // absolutely positioned content overlay
}
```
Implementation: build path with `M/L/Q/C` — top edge: from left corner, cubic bezier rising slightly to center, concave dip (quadratic down `notchDepth` over `notchWidth`), mirror to right corner. Use `Svg`, `Path`, `Defs`, `LinearGradient`. Preserve aspect via explicit width/height props (recompute path in `useMemo`). Used by:
- `MiniCartBar` (home bottom bar, height ~96, burgundy gradient, notch on top edge center — the little white dash/handle above the notch is a separate 32×4 rounded view)
- Cart screen main burgundy container (notch top center, radius 44)
- Cart summary card (summaryPink gradient, notch top AND bottom center, radius 32, internal divider line between "Delivery charge" row and "Total Amount")

## 5. Components
- `AppBackground` — gradient + decorative blurred circles (§2)
- `GlassCard` — cardPink translucent card: expo-blur `BlurView` intensity 40 tint "light" + overlay LinearGradient (`rgba(255,255,255,0.65)` → `rgba(251,224,230,0.35)`) + 1px `rgba(255,255,255,0.7)` border, radius 36, soft shadow (`#B76E79` @ 0.18, radius 30, y 16)
- `ProductImage` — memoized Image wrapper with continuous Reanimated loop: translateY ±6 (2.8s ease in-out), rotate ±2°, scale 1↔1.02 breathing; optional base rotation prop (home card uses -18°)
- `CategoryChip` — text chip + circular icon chip variants; animated bg color / scale on selection (withTiming 200ms)
- `PriceTag` — pill with formatted price
- `Buttons` — `IconCircleButton`, `AddToCartBar` (cart fly-out animation target), `MakePaymentBar`
- `ProductCard` — the home featured card (§6)
- `MiniCartBar` — CartShape + badge circle (cream ∅40, count) + "Cart / n Items" + right stacked product thumbnails (∅44 circles, translucent white ring, overlapping -12)
- `icons.tsx` — inline SVG icon set: cart/basket, arrow-right, chevron-left, plus, minus, ice-cream-cone, popsicle, candy, chevrons-right (stroke 2, currentColor)

## 6. Screens
### Home (`src/screens/Home/HomeScreen.tsx`)
Layout top→bottom: greeting block (two lines, "Better " regular + "Ice cream" bold / "better planet") left, avatar ∅56 circle (avatar.png in light lavender-grey circle `#E8E4EC`) right → chip row: "All" text chip, "Ice-Cream" active chip (ice-cream-cone icon + label, chipActiveBg), popsicle icon chip, candy icon chip → "Flavor of the week" + arrow → **featured ProductCard**: GlassCard height ~400; inside: product name (top-left), subtitle pill (white 60% bg, radius 16, px 14, h 32), price bottom-left, FAB bottom-right; ProductImage centered-right, rotated -18°, slight right bleed, drop shadow. Card = one item of horizontal FlatList (`pagingEnabled` false, `snapToInterval = CARD_WIDTH + 20`, `decelerationRate="fast"`); **Reanimated scroll animations**: on scrollX — outgoing card rotate ±4°, incoming scale 0.92→1, opacity 0.6→1, image translateX parallax 30px, title translateY + opacity stagger, price fades, card bg tint interpolates toward product.cardColors. → `MiniCartBar` fixed at bottom (above safe area), tap → Cart screen.
### Product Detail (`src/screens/Product/ProductScreen.tsx`)
Header: back circle button (chevron-left, white 70% bg ∅44) left, product name centered 22px. Center: ProductImage large (~300×300, straight, floating loop + soft elliptical shadow below via blurred black ellipse opacity 0.15). Bottom cluster: qty row ("+" | big number 2-digit | "−"), cream price pill, AddToCartBar. Floating mini cart icon top-right? (reference: none — skip). **Liquid Swipe product switching**: horizontal pan gesture (Gesture.Pan) on the product area; on drag, current product translateX + scaleX stretch (1 + |x|/400) like liquid with skewX ±8°, next product revealed beneath sliding in with springy overshoot (`withSpring` damping 12 stiffness 90); on release past 40% width commit switch: title cross-fades (translateY 12 + opacity), price pill scale-pops, quantity resets to 1 with count-up, background gradient of screen subtly tint-shifts toward product.cardColors.bg; else elastic snap-back. Implement in `src/animations/useLiquidSwipe.ts`.
### Cart (`src/screens/Cart/CartScreen.tsx`)
Header: "Cart" left, cream circle badge (count) right. Burgundy CartShape container below (flex 1 to bottom): rows (staggered entrance: translateY 24 + opacity, 80ms stagger, 350ms) — thumbnail circle, name/subtitle, price pill right. Summary card: CartShape (bottomNotch, divider) — "Delivery charge $04.44", divider, "Total Amount" / "USD xx.xx" + dessert-cup.png bottom-right (~110×110, slight rotation 8°, overlapping). MakePaymentBar at bottom inside container (slides up 40→0 + fade on mount, delay 300ms).
### Shared-element-ish transition Home→Detail: use Reanimated layout—keep pragmatic: navigation with `animation: 'fade_from_bottom'`; product image scales from card size to detail size via entering animation (`FadeInDown`/`ZoomIn` 400ms), title/price stagger in.

## 7. Navigation (`src/navigation/RootNavigator.tsx`)
native-stack, headerShown false: Home → Product (params {productId}) → Cart (modal slide-up). CartProvider wraps NavigationContainer. `src/hooks/useCart.ts`, `useHaptics.ts` (expo-haptics light on chip/quantity/add). `src/utils/format.ts` currency formatter. `src/types/index.ts`.

## 8. Performance
React.memo on all list-row/card components; `useSharedValue` scrollX only (no setState on scroll); FlatList `windowSize=3`, `initialNumToRender=3`, `getItemLayout`; images `resizeMode="contain"`, `fadeDuration={0}`; SVG paths memoized.

## 9. Required folder structure
Exactly as the brief: src/{assets/{generated-products,icons,backgrounds}, animations, components/{ProductCard,GlassCard,CartShape,ProductImage,CategoryChip,PriceTag,Buttons}, screens/{Home,Product,Cart}, navigation, hooks, theme, constants, services, utils, types} + App.tsx, package.json, tsconfig.json, babel.config.js (reanimated plugin), metro.config.js if needed, index.ts entry.

## 10. Acceptance
- `npx tsc --noEmit` passes; `npx expo export --platform web` NOT required; code must be runnable via `npm install && npx expo start`.
- All three screens match reference layout/spacing/colors; 5 generated products used; CartShape SVG reused on home + cart; liquid swipe + carousel animations implemented with Reanimated.
