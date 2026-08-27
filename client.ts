export class RealtimeStateClient {
  private ws: WebSocket;
  private state: any = {};
  private listeners: Map<string, Function[]> = new Map();
  private operations: any[] = [];
  private clientId: number | null = null;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.ws.onopen = () => {
      console.log('Connected to realtime state sync server');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from server');
      this.emit('disconnect');
    };
  }

  private handleMessage(message: any): void {
    if (message.type === 'state') {
      this.state = message.data;
      this.clientId = message.clientId;
      this.emit('state', this.state);
    } else if (message.type === 'operation') {
      const { op, path, value, clientId } = message;
      
      if (clientId !== this.clientId) {
        if (op === 'set') {
          this.setNestedProperty(this.state, path, value);
        } else if (op === 'delete') {
          this.deleteNestedProperty(this.state, path);
        }
      }
      
      this.emit('change', path, value);
      this.emit('operation', message);
    }
  }

  public set(path: string, value: any): void {
    this.setNestedProperty(this.state, path, value);
    
    const message = JSON.stringify({
      type: 'operation',
      op: 'set',
      path: path,
      value: value,
    });
    
    this.ws.send(message);
    this.emit('change', path, value);
  }

  public get(path?: string): any {
    if (!path) return this.state;
    
    const keys = path.split('.');
    let current = this.state;
    for (const key of keys) {
      current = current?.[key];
    }
    return current;
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, ...args: any[]): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        callback(...args);
      });
    }
  }

  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  private deleteNestedProperty(obj: any, path: string): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    delete current[keys[keys.length - 1]];
  }

  public disconnect(): void {
    this.ws.close();
  }
}
