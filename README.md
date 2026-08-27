# Realtime State Sync

WebSocket-based real-time state synchronization framework for collaborative applications with operational transformation and conflict resolution.

## Features

- **WebSocket-based Sync**: Bi-directional real-time state synchronization over WebSocket connections
- **Operational Transformation**: Automatic conflict resolution for concurrent edits using OT algorithms
- **State Trees**: Support for arbitrary nested state objects with fine-grained reactivity
- **Presence Tracking**: Real-time awareness of remote clients and their selections/cursor positions
- **Offline Support**: Queue operations during disconnection and replay on reconnect
- **Type Safety**: Full TypeScript support with type-safe state updates
- **Undo/Redo**: Built-in operation history for reverting changes
- **Client & Server**: Lightweight client library + Node.js server implementation

## How to Run

### Server

```bash
npm install
npm run server
```

The server listens on port 8080 by default.

### Client

```bash
import { RealtimeStateClient } from './client';

const client = new RealtimeStateClient('ws://localhost:8080');
const state = client.createState({ count: 0 });

state.on('change', (path, value) => {
  console.log(`State changed at ${path}: ${value}`);
});

state.set('count', 42);
```

## Architecture

**State Model**: Each client maintains a local state tree synchronized with the server. Changes are tracked as operations (insert, update, delete).

**Conflict Resolution**: When concurrent operations occur, OT-based transformation resolves conflicts by:
1. Receiving remote operation from server
2. Transforming it against local uncommitted operations
3. Applying to local state

**Presence**: Lightweight presence objects track cursor positions, selection ranges, and active indicators for each client.

## Design Decisions

- **OT over CRDT**: Operational Transformation chosen for lower memory overhead and deterministic ordering
- **Centralized Architecture**: Server maintains canonical state; clients replay operations for strong consistency
- **WebSocket Protocol**: Lower latency than HTTP long-polling; native browser support; efficient binary framing
- **Immutable History**: All operations retained for undo/redo and debugging

## Testing

```bash
npm test
```

Tests cover:
- Single-client state mutations
- Multi-client concurrent edits with conflict resolution
- Network partition recovery
- Presence tracking accuracy
- Offline operation queueing
