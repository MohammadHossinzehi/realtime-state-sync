import { RealtimeStateClient } from './client';

describe('RealtimeStateClient', () => {
  let client: RealtimeStateClient;

  beforeEach(() => {
    client = new RealtimeStateClient('ws://localhost:8080');
  });

  afterEach(() => {
    client.disconnect();
  });

  test('should initialize with empty state', (done) => {
    client.on('state', (state) => {
      expect(state).toBeDefined();
      done();
    });
  });

  test('should set nested property correctly', (done) => {
    client.on('state', () => {
      client.set('user.name', 'John');
      
      client.on('change', (path, value) => {
        expect(path).toBe('user.name');
        expect(value).toBe('John');
        done();
      });
    });
  });

  test('should broadcast operations to all clients', (done) => {
    let operationReceived = false;
    
    client.on('operation', (operation) => {
      expect(operation.type).toBe('operation');
      expect(operation.op).toBeDefined();
      operationReceived = true;
      done();
    });

    client.on('state', () => {
      client.set('counter', 1);
    });
  });

  test('should retrieve state by path', (done) => {
    client.on('state', () => {
      client.set('data.count', 42);
      
      setTimeout(() => {
        const value = client.get('data.count');
        expect(value).toBe(42);
        done();
      }, 100);
    });
  });

  test('should emit error on connection failure', (done) => {
    const failClient = new RealtimeStateClient('ws://invalid-server:9999');
    
    failClient.on('error', (error) => {
      expect(error).toBeDefined();
      failClient.disconnect();
      done();
    });
  });

  test('should handle concurrent updates', (done) => {
    client.on('state', () => {
      client.set('a', 1);
      client.set('b', 2);
      client.set('c', 3);
      
      setTimeout(() => {
        expect(client.get('a')).toBe(1);
        expect(client.get('b')).toBe(2);
        expect(client.get('c')).toBe(3);
        done();
      }, 100);
    });
  });
});
