import { useRouter } from 'next/router';
import * as yup from 'yup';

interface useNextQueryOptions {
  initialState: any;
}

const useNextQuery = <T extends yup.Schema>(schema: T, options: useNextQueryOptions) => {
  const router = useRouter();

  const { initialState } = options;

  const isInitialStateValid = schema.test(initialState);

  if (!isInitialStateValid) throw new Error('initial state is not compatible with provided schema');

  type schemaAsType = yup.InferType<typeof schema>;
  type UpdateFunction = <K extends keyof schemaAsType>(key: K, value: schemaAsType[K]) => void;
  const update: UpdateFunction = (key, value) => {};

  const name: schemaAsType = {};
  return {
    update,
    name,
  };
};

export default useNextQuery;
