import qs from 'qs';
import * as yup from 'yup';
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
    onBeforeQueryUpdate: routerPushEventHander;
    onAfterQueryUpdate: routerPushEventHander;
    qsConfig: IQSOptions;
}
/**
 * A custom hook for working with Next.js router and Yup schema validation.
 * @template T - The schema type for validation.
 * @param {yup.ObjectSchema<T>} schema - The Yup schema to validate the initial state.
 * @param {useNextQueryOptions} options - Options for the hook.
 *
 * @throws {Error} Throws an error if the initial state is not compatible with the provided schema.
 */
declare const useNextQuery: <T>(schema: yup.ObjectSchema<T, yup.AnyObject, any, "">, options: useNextQueryOptions) => {
    update: <K extends keyof (T extends yup.AnyObject ? yup.MakePartial<T> extends infer T_1 ? T_1 extends yup.MakePartial<T> ? T_1 extends {} ? { [k in keyof T_1]: T_1[k]; } : T_1 : never : never : T)>(key: K, value: (T extends yup.AnyObject ? yup.MakePartial<T> extends infer T_1 ? T_1 extends yup.MakePartial<T> ? T_1 extends {} ? { [k in keyof T_1]: T_1[k]; } : T_1 : never : never : T)[K]) => void;
    watch: <K_1 extends keyof (T extends yup.AnyObject ? yup.MakePartial<T> extends infer T_1 ? T_1 extends yup.MakePartial<T> ? T_1 extends {} ? { [k in keyof T_1]: T_1[k]; } : T_1 : never : never : T)>(key: K_1, callback: (value: (T extends yup.AnyObject ? yup.MakePartial<T> extends infer T_1 ? T_1 extends yup.MakePartial<T> ? T_1 extends {} ? { [k in keyof T_1]: T_1[k]; } : T_1 : never : never : T)[K_1]) => void) => void;
    state: import("react").MutableRefObject<any>;
};
export default useNextQuery;
//# sourceMappingURL=useNextQuery.d.ts.map