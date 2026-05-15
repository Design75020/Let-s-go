# Security Specification - LetsGoFood

## Data Invariants
1. A user profile can only be created by the authenticated user it represents.
2. Roles are immutable after creation (except by admin).
3. Restaurants can only be updated by their owner.
4. Menu items must belong to a valid restaurant and can only be managed by the restaurant owner.
5. Orders can only be read by the client who placed it, the restaurant, and the assigned driver.
6. Order status transitions must follow a logical flow (e.g., preparing -> picked_up).

## The Dirty Dozen Payloads (Attacker Strategy)

1. **Identity Spoofing**: Attempt to create a user profile with `uid` of another user.
2. **Privilege Escalation**: User tries to update their own role to 'admin'.
3. **Ghost Field Injection**: Adding `isVerified: true` to a restaurant document.
4. **Orphaned Menu Item**: Creating a menu item for a non-existent restaurant.
5. **Unauthorized Menu Edit**: Client A tries to change the price of a dish in Restaurant B.
6. **Status Shortcut**: Client tries to mark their own order as 'delivered'.
7. **Cross-Tenant Read**: Client A tries to list orders belonging to Client B.
8. **Denial of Wallet (ID Poisoning)**: Document ID with 1MB of junk characters.
9. **PII Leak**: Authenticated user tries to 'get' another user's private profile (if we had one).
10. **Resource Exhaustion**: Sending a 1MB string in the 'name' field.
11. **Timestamp Spoofing**: Sending a `createdAt` from 2010.
12. **Relational Breakage**: Creating an order for a restaurant that doesn't exist.

## The Test Runner (firestore.rules.test.ts)
*(Mocked logic for this specification)*
- `test('Identity Spoofing')` -> `expect(create_fail)`
- `test('Privilege Escalation')` -> `expect(update_fail)`
- ...
