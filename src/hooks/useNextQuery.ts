import isEqual from "lodash/isEqual";
import qs from "qs";
import { useEffect, useMemo, useRef, useState } from "react";
import * as yup from "yup";

const checkListsEquality = (list1: string[], list2: string[]): boolean => {
  // Sort the lists in ascending order
  const sortedList1 = list1.slice().sort();
  const sortedList2 = list2.slice().sort();

  // Check if the lengths are equal
  if (sortedList1.length !== sortedList2.length) {
    return false;
  }

  // Compare each item at the corresponding index
  return sortedList1.every((item, index) => item === sortedList2[index]);
};

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
export const useBackwardState = <T>(
  initialState: T
): [BackwardState<T>, (newState: T) => void] => {
  const [state, setState] = useState<BackwardState<T>>({
    currentState: initialState,
    prevState: null,
  });
  /**
  
  Updates the state with a new state value.
  @param {T} newState - The new state value.
  */
  const update = (newState: T) => {
    setState((currentState) => {
      const { currentState: current } = currentState;
      const newPrevState = current;
      return {
        prevState: newPrevState,
        currentState: newState,
      };
    });
  };
  return [state, update];
};

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

interface IQueryParamObserver {
  callback: () => void; // TODO fix any type
  subscriptionKeyList: string[];
}

type keyListItem = string[];

class KeyList {
  keyList: keyListItem[] = [];
  add = (keyList: keyListItem) => {};
}

class QueryParamObserver {
  private observationList: IQueryParamObserver[] = [];
  public subscribe = (keys: string[], callback: () => void) => {
    const isKeyListAvailable = this.observationList.some((observationItem) =>
      checkListsEquality(observationItem.subscriptionKeyList, keys)
    );
    if (isKeyListAvailable) return;
    const queryParamObserver: IQueryParamObserver = {
      callback: callback,
      subscriptionKeyList: keys,
    };
    this.observationList.push(queryParamObserver);
  };

  public callSubscriptions = (currentState: any, previousState: any) => {
    this.observationList.forEach((observationItem) => {
      const { callback, subscriptionKeyList } = observationItem;

      const isKeyValueSameInBothValues = subscriptionKeyList.every(
        (subscriptionKey) =>
          isEqual(
            currentState?.[subscriptionKey],
            previousState?.[subscriptionKey]
          )
      );

      const isCallable =
        !isKeyValueSameInBothValues || subscriptionKeyList.length === 0;

      if (!isCallable) return;
      //@ts-ignore // TODO fix type issue
      callback(currentState);
    });
  };
}

/**
 * A custom hook for working with Next.js router and Yup schema validation.
 * @template T - The schema type for validation.
 * @param {yup.Schema<T>} schema - The Yup schema to validate the initial state.
 * @param {useNextQueryOptions} options - Options for the hook.
 *
 * @throws {Error} Throws an error if the initial state is not compatible with the provided schema.
 */
const useNextQuery = <T>(
  schema: yup.Schema<T>,
  options: useNextQueryOptions
) => {
  const {
    initialState,
    qsConfig = { parsedQs: {}, stringifyOptions: {} },
    onBeforeQueryUpdate,
    onAfterQueryUpdate,
  } = options;

  // initialization
  type schemaAsType = yup.InferType<typeof schema>;
  const [queryState, setQueryState] = useBackwardState<schemaAsType | null>(null);
  const [queryUpdateList, setQueryUpdateList] = useState<{key: string;value: string}[]>([]); // TODO fixType
  const paramObserver = useMemo(() => new QueryParamObserver(), []);
  const isInitialStateValid = true; // checking if provided initial state matches the schema
  const _initialState = useRef(initialState);

  const delayTimeoutRef = useRef<any>(null);

  if (!isInitialStateValid) throw new Error("initial state is not compatible with provided schema!");

  //!SECTION anchor update method
  /**@type {update: (key: keyof yup.InferType<T>, value: yup.InferType<T[keyof T]>): void};*/
  type UpdateFunction = <K extends keyof schemaAsType>(
    key: K,
    value: schemaAsType[K]
  ) => void;
  const update: UpdateFunction = (key, value) => {
    updateQueryParam((currentValue) => ({ ...currentValue, [key]: value }));
  };


  //!SECTION anchor update method
  /**@type {delayedUpdate: (key: keyof yup.InferType<T>, value: yup.InferType<T[keyof T]>): void};*/
  type delayedUpdateFunction = <K extends keyof schemaAsType>(key: K,value: schemaAsType[K]) => void;
  const delayedUpdate: delayedUpdateFunction = (key, value) => {
    const keyAsString = key as string;
    const valueAsString = value as string
    setQueryUpdateList((prevState) => [...prevState,{ value: valueAsString, key: keyAsString },]);
  };

  //!SECTION anchor update method
  /**@type {deleteKey: (key: keyof yup.InferType<T>): void};*/
  type deleteKeyFunction = <K extends keyof schemaAsType>(key: K) => void;
  const deleteKey: deleteKeyFunction = (key) => {
    updateQueryParam((currentValue) => {
      const newValue = { ...currentValue };
      delete newValue?.[key];
      return newValue;
    });
  };


  // !SECTION anchor watch function
  /**@type {update: (keys: keyof yup.InferType<T>[], callback: (yup.InferType<T[keyof T]>) => void): void};*/
  type WatchFunction = <K extends keyof schemaAsType>(
    key: K[],
    callback: (value: schemaAsType[K]) => void
  ) => void;
  const watch: WatchFunction = (keys, callback) =>
    paramObserver.subscribe(keys as string[], callback as any); // TODO fix any

  const updateQueryParam = (updateCallback: (currentValue: any) => any) => {
    // TODO Fix Type
    const res = updateCallback(queryState.currentState);
    setQueryState(res);
  };

  // side effects
  useEffect(() => {
    updateQueryParam(() => _initialState.current);
  }, []);

  useEffect(() => {
    console.count("def")
    const { currentState, prevState } = queryState;
    const isQueryStateChanged = !isEqual(currentState, prevState);

    if (isQueryStateChanged) {
      onBeforeQueryUpdate && onBeforeQueryUpdate();
      const stringifiedQuery = qs.stringify(
        currentState,
        qsConfig.stringifyOptions
      );
      window.history.pushState({}, "", `?${stringifiedQuery}`);
      paramObserver.callSubscriptions(currentState, prevState);
      onAfterQueryUpdate && onAfterQueryUpdate();
    }
  }, [queryState]);


  //@ts-ignore
  useEffect(() => {
    if (queryUpdateList.length) {
      delayTimeoutRef.current = setTimeout(() => {
        const updateObject = queryUpdateList.reduce(
          (acc, cur) => ({ ...acc, [cur.key]: cur.value }),
          {}
        );

        updateQueryParam((queryParamPrevState) => ({
          ...queryParamPrevState,
          ...updateObject,
        }));

        setQueryUpdateList([]);
      }, 50);
      return () => {
        if (delayTimeoutRef.current) {
          clearTimeout(delayTimeoutRef.current);
          delayTimeoutRef.current = null;
        }
      };
    }
  }, [queryUpdateList]);

  return {
    update,
    deleteKey,
    delayedUpdate,
    watch,
    state: queryState.currentState,
  };
};

export default useNextQuery;
