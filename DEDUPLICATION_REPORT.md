# AUDIT DEDUPLICATION & ARCHITECTURE - LETSGOFOOD V10

## 1. DUPLICATE BUSINESS LOGIC
- **Order Updates:** Status transitions logic (accept, prepare, deliver) is partially in `MerchantPortal.tsx`, `DriverApp.tsx`, and `OrderTracking.tsx`.
- **Price Calculation:** `ClientStore.tsx` calculates the total price on the fly. While the backend validates it, the frontend logic is duplicated in the cart view and the checkout summary.
- **Auth Checks:** Domain-based routing in `App.tsx` and role checks in `ProtectedRoute.tsx` overlap.

## 2. DUPLICATE COMPONENTS (PRIMITIVES)
- **Buttons:** Over 100 instances of `<button>` with various `bg-emerald-500`, `bg-blue-600`, etc., without a single reusable `Button` component.
- **Cards:** Restaurant cards in `ClientStore.tsx` and `LandingPage.tsx` use different styles for similar purposes.
- **Modals:** Custom modal implementations in `MerchantPortal` (menu edit) and `AdminPortal` (KYC) use slightly different overlay and animation logic.
- **Loaders:** `Loader2` from lucide-react is used with manual `animate-spin` in multiple places instead of a `Spinner` component.

## 3. DUPLICATE API CALLS / LISTENERS
- **Firestore Snapshots:**
    - `MerchantPortal` listens to `orders`.
    - `AdminPortal` listens to `orders`.
    - `DriverApp` listens to `availableOrders`.
    - `OrderTracking` listens to a specific `order`.
    - There is no centralized `RealtimeService` to manage these subscriptions efficiently.
- **Auth Context:** `AuthContext.tsx` handles the main state, but `authApi.ts` has redundant login methods.

## 4. DUPLICATE STATE MANAGEMENT
- **Basket/Cart:** Only exists in `ClientStore.tsx` as a local `useState`. If a user navigates away or refreshes (depending on state persistence), this is fragile. It should be in a global `CartStore`.
- **User Role:** Derived from the user document in multiple components instead of being a reactive property of the Auth store.

## 5. DESIGN SYSTEM INCONSISTENCIES
- **Spacing:** Mixed use of `p-4`, `p-6`, `gap-2`, `gap-4` without a clear scale.
- **Colors:** `emerald-500` is the primary brand color but is sometimes substituted with `green-500`.
- **Typography:** Font sizes range from `text-[10px]` to `text-3xl` with arbitrary `font-black`, `font-bold`, etc.

## 6. PROPOSED CLEANUP
- **Extract Features:** Move `ClientStore`, `MerchantPortal`, `DriverApp` into `/features`.
- **Shared UI:** Create `/components/ui` for `Button`, `Input`, `Card`, `Modal`, `Badge`.
- **Centralized Store:** Use a single store for `Auth`, `Cart`, and `Realtime`.
- **Realtime Service:** Centralize all Firestore listeners.

---
**Verdict:** High duplication (approx. 40% of UI code is redundant styles). Logic is fragmented across the big component files.
