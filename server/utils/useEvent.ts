import {useRequest} from "nitro/context";
import type {H3EventContext} from "nitro/h3";

/**
 * Returns the current request and its event context (the same object as `event.context` in handlers).
 * Replacement for nitropack's `useEvent()`, requires `experimental.asyncContext`.
 *
 * Responses can't be written through it: return them from the handler instead.
 */
export const useEvent = () => {
    const req = useRequest()
    return {
        req,
        context: (req.context ??= {}) as H3EventContext
    }
}
