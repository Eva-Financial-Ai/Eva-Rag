/**
 * EventBusService - Pub/Sub system for component communication
 * Enables async communication between Credit Application, Deal Structuring, and FileLock
 */

export type EventType = 
  | 'credit-application:submitted'
  | 'credit-application:updated'
  | 'credit-application:approved'
  | 'credit-application:document-uploaded'
  | 'deal-structuring:initiated'
  | 'deal-structuring:option-selected'
  | 'deal-structuring:term-sheet-generated'
  | 'deal-structuring:approved'
  | 'filelock:document-uploaded'
  | 'filelock:document-shared'
  | 'filelock:document-signed'
  | 'filelock:documents-requested'
  | 'workflow:stage-changed'
  | 'transaction:created'
  | 'transaction:updated';

export interface EventPayload {
  creditApplication?: {
    id: string;
    applicantName: string;
    amount: number;
    type: string;
    documents?: string[];
    status: string;
    progress: number;
    connectedAccounts?: number;
    generatedDocuments?: any[];
  };
  dealStructuring?: {
    transactionId: string;
    selectedOption?: any;
    termSheet?: any;
    status: string;
  };
  filelock?: {
    documentId: string;
    documentName: string;
    documentType: string;
    action: string;
    transactionId?: string;
    applicationId?: string;
  };
  workflow?: {
    stage: string;
    previousStage?: string;
    transactionId: string;
  };
  transaction?: {
    id: string;
    type: string;
    amount: number;
    status: string;
    data: any;
  };
}

type EventCallback = (payload: EventPayload) => void | Promise<void>;

class EventBusService {
  private subscribers: Map<EventType, Set<EventCallback>> = new Map();
  private eventQueue: Array<{ type: EventType; payload: EventPayload }> = [];
  private isProcessing = false;

  /**
   * Subscribe to an event
   */
  subscribe(eventType: EventType, callback: EventCallback): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  /**
   * Subscribe to multiple events
   */
  subscribeMultiple(eventTypes: EventType[], callback: EventCallback): () => void {
    const unsubscribers = eventTypes.map(eventType => 
      this.subscribe(eventType, callback)
    );
    
    // Return function to unsubscribe from all
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Publish an event (async)
   */
  async publish(eventType: EventType, payload: EventPayload): Promise<void> {
    // Add to queue
    this.eventQueue.push({ type: eventType, payload });
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Publish an event synchronously
   */
  publishSync(eventType: EventType, payload: EventPayload): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Process event queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (!event) continue;
      
      const callbacks = this.subscribers.get(event.type);
      if (callbacks) {
        // Process callbacks in parallel
        const promises = Array.from(callbacks).map(async callback => {
          try {
            await callback(event.payload);
          } catch (error) {
            console.error(`Error in async event handler for ${event.type}:`, error);
          }
        });
        
        await Promise.all(promises);
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Clear all subscriptions (useful for testing)
   */
  clear(): void {
    this.subscribers.clear();
    this.eventQueue = [];
    this.isProcessing = false;
  }

  /**
   * Get subscriber count for an event type
   */
  getSubscriberCount(eventType: EventType): number {
    return this.subscribers.get(eventType)?.size || 0;
  }
}

// Export singleton instance
export const eventBus = new EventBusService();

// Helper functions for common operations
export const creditApplicationEvents = {
  submitApplication: (applicationData: EventPayload['creditApplication']) => 
    eventBus.publish('credit-application:submitted', { creditApplication: applicationData }),
  
  updateApplication: (applicationData: EventPayload['creditApplication']) =>
    eventBus.publish('credit-application:updated', { creditApplication: applicationData }),
  
  approveApplication: (applicationData: EventPayload['creditApplication']) =>
    eventBus.publish('credit-application:approved', { creditApplication: applicationData }),
  
  uploadDocument: (documentData: EventPayload['filelock']) =>
    eventBus.publish('credit-application:document-uploaded', { filelock: documentData })
};

export const dealStructuringEvents = {
  initiateDeal: (dealData: EventPayload['dealStructuring']) =>
    eventBus.publish('deal-structuring:initiated', { dealStructuring: dealData }),
  
  selectOption: (dealData: EventPayload['dealStructuring']) =>
    eventBus.publish('deal-structuring:option-selected', { dealStructuring: dealData }),
  
  generateTermSheet: (dealData: EventPayload['dealStructuring']) =>
    eventBus.publish('deal-structuring:term-sheet-generated', { dealStructuring: dealData }),
  
  approveDeal: (dealData: EventPayload['dealStructuring']) =>
    eventBus.publish('deal-structuring:approved', { dealStructuring: dealData })
};

export const fileLockEvents = {
  uploadDocument: (documentData: EventPayload['filelock']) =>
    eventBus.publish('filelock:document-uploaded', { filelock: documentData }),
  
  shareDocument: (documentData: EventPayload['filelock']) =>
    eventBus.publish('filelock:document-shared', { filelock: documentData }),
  
  signDocument: (documentData: EventPayload['filelock']) =>
    eventBus.publish('filelock:document-signed', { filelock: documentData }),
  
  requestDocuments: (documentData: EventPayload['filelock']) =>
    eventBus.publish('filelock:documents-requested', { filelock: documentData })
};

export const workflowEvents = {
  changeStage: (workflowData: EventPayload['workflow']) =>
    eventBus.publish('workflow:stage-changed', { workflow: workflowData })
};

export default eventBus;