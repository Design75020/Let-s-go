# TECHNICAL DEBT REPORT

## 1. Auth Persistence
- Current strategy relies on Firebase default persistence.
- Recommendation: Add explicit session refresh logic for very long-running dashboard sessions.

## 2. Geolocation
- Address selection currently uses `prompt()`.
- Recommendation: Replace with Google Maps Autocomplete API.

## 3. UI Abstraction
- Many components share similar "glass" card logic.
- Recommendation: Create a shared UI library in `source/components/ui/`.
