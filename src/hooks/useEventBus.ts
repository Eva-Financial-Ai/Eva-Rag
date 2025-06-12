import { useEffect, useCallback, useRef } from 'react';
import eventBus, { EventType, EventPayload } from '../services/EventBusService';

/**
 * Hook to subscribe to event bus events
 */
export function useEventSubscription(
  eventType: EventType | EventType[],
  callback: (payload: EventPayload) => void | Promise<void>,
  deps: React.DependencyList = []
) {
  const callbackRef = useRef(callback);
  
  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    // Wrapper to use the latest callback
    const handler = (payload: EventPayload) => callbackRef.current(payload);
    
    // Subscribe to single or multiple events
    const unsubscribe = Array.isArray(eventType)
      ? eventBus.subscribeMultiple(eventType, handler)
      : eventBus.subscribe(eventType, handler);
    
    return unsubscribe;
  }, [eventType, ...deps]);
}

/**
 * Hook to publish events
 */
export function useEventPublisher() {
  const publish = useCallback(async (eventType: EventType, payload: EventPayload) => {
    await eventBus.publish(eventType, payload);
  }, []);
  
  const publishSync = useCallback((eventType: EventType, payload: EventPayload) => {
    eventBus.publishSync(eventType, payload);
  }, []);
  
  return { publish, publishSync };
}

/**
 * Combined hook for both subscribing and publishing
 */
export function useEventBus() {
  const { publish, publishSync } = useEventPublisher();
  
  const subscribe = useCallback((
    eventType: EventType | EventType[],
    callback: (payload: EventPayload) => void | Promise<void>
  ) => {
    return Array.isArray(eventType)
      ? eventBus.subscribeMultiple(eventType, callback)
      : eventBus.subscribe(eventType, callback);
  }, []);
  
  return { publish, publishSync, subscribe };
}