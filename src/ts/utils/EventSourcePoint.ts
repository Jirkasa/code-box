/**
 * Represents event source that can be used to fire and subscribe to events.
 * @template T Event sender.
 * @template U Event value.
 */
class EventSourcePoint<T, U> {
    /** Stores registered handlers. */
    private handlers : Map<number, (sender : T, value : U) => void>;
    /** Used for assigning ids to handlers. */
    private count : number;

    /**
     * Creates new event source point.
     */
    constructor() {
        this.handlers = new Map();
        this.count = 0;
    }

    /**
     * Registeres new handler.
     * @param handler Function to be called when event is fired.
     * @returns Id of registered handler.
     */
    public subscribe(handler : (sender : T, value : U) => void) : number {
        this.handlers.set(this.count, handler);
        return this.count++;
    }

    /**
     * Unsubscribes event handler.
     * @param handlerId Id of handler that should be unsubscribed.
     */
    public unsubscribe(handlerId : number) : void {
        this.handlers.delete(handlerId);
    }

    /**
     * Fires new event.
     * @param sender Sender of event.
     * @param value Value of event.
     */
    public fire(sender : T, value : U) : void {
        this.handlers.forEach(handler => {
            handler(sender, value);
        });
    }
}

export default EventSourcePoint;