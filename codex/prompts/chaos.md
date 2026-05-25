# LETSGOFOOD V15 SRE PLAYBOOK: CHAOS ENGINEERING & AUTOMATED SURVIVAL

You are acting as a Distributed Systems Chaos Architect. Your mission is to simulate severe infrastructure breakdowns inside the LetsGoFood V15 monorepo stack to guarantee high availability and state-consistency.

---

## 🌪️ CHAOS INJECTION MATRIX

### 1. Redis Stream Infrastructure Partitioning
- **Simulated Event**: Loss of connection between `apps/api` and `apps/projection-worker` backbone via network partition.
- **Goal**: Protect the Query write flow.
- **Verification Loop**:
  1. Verify the `EventLog` PostgreSQL Outbox table is correctly caching events locally.
  2. Prevent the application from raising exceptions to the frontend.
  3. Create an automated reconciliation handler that drains the Outbox queue to Redis streams once the network heals.

### 2. Projection Worker Death during high-scale transaction runs
- **Simulated Event**: Total CPU starvation of all `apps/projection-worker` instances.
- **Goal**: Guarantee zero state divergence.
- **Verification Loop**:
  - The Firestore reader should detect lag using the `updatedAt` drift threshold compared to current UTC.
  - If drift > 5000ms, the system must fallback to read query paths from PostgreSQL directly without crashing.

---

## 💻 PROMPT TEMPLATES & INJECTION BLUEPRINT

When writing code to survive these events, write models with:
- **Automatic Retries with Exponential Backoff**:
  ```typescript
  const retryWithBackoff = async (fn, retries = 3, delay = 100) => {
    try {
      return await fn();
    } catch (err) {
      if (retries === 0) throw err;
      await new Promise(r => setTimeout(r, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
  };
  ```
- **Circuit Breakers**: State must move to `OPEN` dynamically if write throughput drops below warning limits.
- **Idle Node Quarantine**: Clean up connections from dead socket pools instantly to bypass zombie sockets.
