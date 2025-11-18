import { EventManagerInterface } from "./EventManagerInterface";

export default class EventManager implements EventManagerInterface {
    private _eventCacheMap: Map<string, EventCache[]> = new Map();
    emit(eventName: string, ...param: any[]): void {
        let eventCacheArray = this._eventCacheMap.get(eventName);
        if (eventCacheArray) {
            let eventCache: EventCache = null;
            for (let i = eventCacheArray.length - 1; i >= 0; i--) {
                eventCache = eventCacheArray[i];
                eventCache.callback.apply(eventCache.target, param);
                if (eventCache.once) {
                    eventCacheArray.splice(i, 1);
                }
            }
        }
    }

    on(eventName: string, callback: Function, target?: any): void {
        this._on(eventName, callback, target, false);
    }

    onOnce(eventName: string, callback: Function, target?: any): void {
        this._on(eventName, callback, target, true);
    }
    private _on(eventName: string, callback: Function, target: any, once: boolean): void {
        let eventCacheArray = this._eventCacheMap.get(eventName);
        if (!eventCacheArray) {
            eventCacheArray = [];
        }
        let index = eventCacheArray.findIndex((eventCache) => {
            return eventCache.target === target && eventCache.callback === callback;
        });

        if (index === -1) {
            eventCacheArray.push({
                target: target,
                callback: callback,
                once: once,
            });
            this._eventCacheMap.set(eventName, eventCacheArray);
        }
    }

    off(eventName: string, callback?: Function, target?: any): void {
        let eventCacheArray = this._eventCacheMap.get(eventName);
        if (eventCacheArray) {
            if (callback && target) {
                let index = eventCacheArray.findIndex((eventCache) => {
                    return eventCache.target === target && eventCache.callback === callback;
                });
                if (index !== -1) {
                    eventCacheArray.splice(index, 1);
                    this._eventCacheMap.set(eventName, eventCacheArray);
                }
            } else {
                eventCacheArray = null;
                this._eventCacheMap.delete(eventName);
            }
        }
    }

    offTarget(target: any): void {
        this._eventCacheMap.forEach((eventCacheArray, eventName) => {
            if (eventCacheArray) {
                for (let i = eventCacheArray.length - 1; i >= 0; i--) {
                    if (eventCacheArray[i].target === target) {
                        eventCacheArray.splice(i, 1);
                    }
                }
            }
        });
    }
}

interface EventCache {
    target: any;
    callback: Function;
    once: boolean;
}
