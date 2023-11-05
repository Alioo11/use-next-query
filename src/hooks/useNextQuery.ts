import * as lodash from 'lodash-es';
import qs from 'qs';
import { useRef, useEffect } from 'react';
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

interface IQueryParamObserver {
  callback: () => void; // TODO fix any type
  subscriptionKey: string;
}

class QueryParamObserver {
  private observationList: IQueryParamObserver[] = [];
  public subscribe = (key: string, callback: () => void) => {
    const queryParamObserver: IQueryParamObserver = { callback: callback, subscriptionKey: key };
    this.observationList.push(queryParamObserver);
  };

  public callSubscriptions = (currentState: any, previousState: any) => {
    this.observationList.forEach((observationItem) => {
      const { subscriptionKey, callback } = observationItem;
      const isKeyValueSameInBothValues = lodash.isEqual(currentState[subscriptionKey], previousState[subscriptionKey]);
      const isCallable = !isKeyValueSameInBothValues || subscriptionKey === null;
      if (!isCallable) return;
      callback();
    });
  };
}

/**
 * A custom hook for working with Next.js router and Yup schema validation.
 * @template T - The schema type for validation.
 * @param {yup.ObjectSchema<T>} schema - The Yup schema to validate the initial state.
 * @param {useNextQueryOptions} options - Options for the hook.
 *
 * @throws {Error} Throws an error if the initial state is not compatible with the provided schema.
 */
const useNextQuery = <T>(schema: yup.ObjectSchema<T>, options: useNextQueryOptions) => {
  const { initialState, qsConfig, onBeforeQueryUpdate, onAfterQueryUpdate } = options;

  const queryCurrentState = useRef<any>(null);
  const queryPreviousState = useRef<any>(null);
  const paramObserver = new QueryParamObserver();

  // const router = useRouter();
  const isInitialStateValid = schema.test(initialState);
  if (!isInitialStateValid) throw new Error('initial state is not compatible with provided schema');

  type schemaAsType = yup.InferType<typeof schema>;

  /**@type {update: (key: keyof yup.InferType<T>, value: yup.InferType<T[keyof T]>): void};*/
  type UpdateFunction = <K extends keyof schemaAsType>(key: K, value: schemaAsType[K]) => void;
  const update: UpdateFunction = (key, value) => (queryCurrentState.current[key] = value);

  /**@type {update: (key: keyof yup.InferType<T>, callback: (yup.InferType<T[keyof T]>) => void): void};*/
  type WatchFunction = <K extends keyof schemaAsType>(key: K, callback: (value: schemaAsType[K]) => void) => void;
  const watch: WatchFunction = (key, callback) => paramObserver.subscribe(key as string, callback as any); // TODO fix any

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
