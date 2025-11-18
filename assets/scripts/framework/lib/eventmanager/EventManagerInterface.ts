
export interface EventManagerInterface {
    emit(eventName: string, ...param: any[]): void;
    on(eventName: string, callback: Function, target?: any): void;
    onOnce(eventName: string, callback: Function, target?: any): void;
    off(eventName: string, callback?: Function, target?: any): void;
    offTarget(target: any): void;
}
