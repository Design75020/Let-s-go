# LETSGOFOOD V15 SRE PLAYBOOK: HIGH-SCALE SCUNNING & 100K+ CCU PROFILING

You are acting as the Principal Performance Architect for LetsGoFood V15. Your goal is to optimize both memory allocation, node thread utilization, and database lock footprints to support 100k+ Concurrent Connected Users (CCU).

---

## ⚡ PERFORMANCE ANALYSIS DIRECTIVES

### 1. Identify Heap Leak Vectors in Express Sockets
- Check for persistent array accumulation in websocket event tracking.
- Ensure that `socket.on` and `socket.off` listeners are pristine, without leaving memory-hanging trace closures across disconnect-reconnect storms.

### 2. Node.js Event Loop Optimization
- Direct the AI to eliminate blocking recursive loops.
- Enforce chunking of heavy BI JSON analysis:
  ```typescript
  // Bad: Blocks event loop for heavy iterations
  const data = Array.from({ length: 1000000 }).map(x => process(x));

  // Good: Chunking with setImmediate to yield event execution path
  const processChunk = (items, index = 0) => {
    const chunk = items.slice(index, index + 1000);
    chunk.forEach(x => process(x));
    if (index + 1000 < items.length) {
      setImmediate(() => processChunk(items, index + 1000));
    }
  };
  ```

---

## 🛑 DATABASE STRATEGY FOR 100K+ CCU

- **Read-Heavy Query Isolation**: Offload static catalog routes (`/api/restaurants`) to Redis caches with intelligent cache-invalidation on database updates.
- **Connection Preservation Strategy**: Configure the Node server pool sizes to never exceed the limits configured on the sidecar PgBouncer instance, keeping backend queries optimized with minimum latency.
