import { TransformFnParams } from 'class-transformer';

export type MaybeType<T> = T | undefined;

export const lowerCaseTransformer = (params: TransformFnParams): MaybeType<string> =>
  params.value?.toLowerCase().trim();
