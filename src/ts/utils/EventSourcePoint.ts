class EventSourcePoint<T, U> {
    private handlers : Map<number, (sender : T, value : U) => void>;
    private count : number;

    constructor() {
        this.handlers = new Map();
        this.count = 0;
    }

    public subscribe(handler : (sender : T, value : U) => void) : number {
        this.handlers.set(this.count, handler);
        return this.count++;
    }

    public unsubscribe(handlerId : number) : void {
        this.handlers.delete(handlerId);
    }

    public fire(sender : T, value : U) : void {
        this.handlers.forEach(handler => {
            handler(sender, value);
        });
    }
}

export default EventSourcePoint;