# SECURITY AUDIT

## 1. Firestore Rules (HIGH)
- Ownership enforcement on `/orders` (Client/Driver/Merchant).
- List queries restricted to 100 docs max.
- Role-based write validation for status updates.

## 2. Authentication (MEDIUM)
- Forced reload on logout to clear memory listeners.
- Protected routes validation.
- Token role-based metadata check in rules.

## 3. Data Exposure (LOW)
- Sensitive user data excluded from public list views.
- Domain check prevents access from unauthorized *.letsgofood.fr.
