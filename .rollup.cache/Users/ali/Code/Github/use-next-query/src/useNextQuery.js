import * as lodash from 'lodash-es';
// import { useRouter } from 'next/router';
import qs from 'qs';
import { useRef, useEffect } from 'react';
class QueryParamObserver {
    constructor() {
        this.observationList = [];
        this.subscribe = (key, callback) => {
            const queryParamObserver = { callback: callback, subscriptionKey: key };
            this.observationList.push(queryParamObserver);
        };
        this.callSubscriptions = (currentState, previousState) => {
            this.observationList.forEach((observationItem) => {
                const { subscriptionKey, callback } = observationItem;
                const isKeyValueSameInBothValues = lodash.isEqual(currentState[subscriptionKey], previousState[subscriptionKey]);
                const isCallable = !isKeyValueSameInBothValues || subscriptionKey === null;
                if (!isCallable)
                    return;
                callback();
            });
        };
    }
}
/**
 * A custom hook for working with Next.js router and Yup schema validation.
 * @template T - The schema type for validation.
 * @param {yup.ObjectSchema<T>} schema - The Yup schema to validate the initial state.
 * @param {useNextQueryOptions} options - Options for the hook.
 *
 * @throws {Error} Throws an error if the initial state is not compatible with the provided schema.
 */
const useNextQuery = (schema, options) => {
    const { initialState, qsConfig, onBeforeQueryUpdate, onAfterQueryUpdate } = options;
    const queryCurrentState = useRef(null);
    const queryPreviousState = useRef(null);
    const paramObserver = new QueryParamObserver();
    // const router = useRouter();
    const isInitialStateValid = schema.test(initialState);
    if (!isInitialStateValid)
        throw new Error('initial state is not compatible with provided schema');
    const update = (key, value) => (queryCurrentState.current[key] = value);
    const watch = (key, callback) => paramObserver.subscribe(key, callback); // TODO fix any
    // side effects
    useEffect(() => {
        queryCurrentState.current = initialState;
    }, [initialState]);
    useEffect(() => {
        const isQueryStateChanged = !lodash.isEqual(queryCurrentState, queryPreviousState);
        if (isQueryStateChanged) {
            onBeforeQueryUpdate && onBeforeQueryUpdate();
            queryPreviousState.current = queryCurrentState.current;
            const stringifiedQuery = qs.stringify(queryCurrentState.current, qsConfig.stringifyOptions);
            window.history.pushState({}, '', `?${stringifiedQuery}`);
            paramObserver.callSubscriptions(queryCurrentState.current, queryPreviousState.current);
            onAfterQueryUpdate && onAfterQueryUpdate();
        }
    }, [queryCurrentState]);
    return {
        update,
        watch,
        state: queryCurrentState,
    };
};
export default useNextQuery;
//# sourceMappingURL=useNextQuery.js.map