import qs from "qs";
import * as yup from "yup";
/**
Represents the state for the backward functionality.
@template T - The type of the state.
@property {T} currentState - The current state.
@property {T | null} prevState - The previous state or null if there is no previous state.
*/
interface BackwardState<T> {
    currentState: T;
    prevState: T | null;
}
/**
 *
  Hook for managing backward functionality.
  @template T - The type of the state.
  @param {T} initialState - The initial state.
  @returns {[BackwardState<T>, (newState: T) => void]} - A tuple containing the current state and a function to update the state.
  */
export declare const useBackwardState: <T>(initialState: T) => [BackwardState<T>, (newState: T) => void];
type routerPushEventHander = () => void;
interface IQSOptions {
    parseOptions: qs.IParseOptions;
    stringifyOptions: qs.IStringifyOptions;
    parsedQs: qs.ParsedQs;
    defaultDecoder: qs.defaultDecoder;
    defaultEncoder: qs.defaultEncoder;
}
interface useNextQueryOptions {
    initialState: any | undefined;
    onBeforeQueryUpdate?: routerPushEventHander;
    onAfterQueryUpdate?: routerPushEventHander;
    qsConfig?: IQSOptions;
}
/**
 * A custom hook for working with Next.js router and Yup schema validation.
 * @template T - The schema type for validation.
 * @param {yup.Schema<T>} schema - The Yup schema to validate the initial state.
 * @param {useNextQueryOptions} options - Options for the hook.
 *
 * @throws {Error} Throws an error if the initial state is not compatible with the provided schema.
 */
declare const useNextQuery: <T>(schema: yup.Schema<T, any, any, "">, options: useNextQueryOptions) => {
    update: <K extends keyof T>(key: K, value: T[K]) => void;
    deleteKey: <K_1 extends keyof T>(key: K_1) => void;
    delayedUpdate: <K_2 extends keyof T>(key: K_2, value: T[K_2]) => void;
    watch: <K_3 extends keyof T>(key: K_3[], callback: (value: T[K_3]) => void) => void;
    state: T;
};
export default useNextQuery;
//# sourceMappingURL=useNextQuery.d.ts.map