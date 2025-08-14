// src/utils/data/useQueryParam.js
'use client';

import { useSearchParams } from 'next/navigation';

/**
 * 指定されたクエリパラメータの値を返すカスタムフック
 * @param {string} paramName - 取得したいクエリパラメータ名
 * @returns {string|null}
 */
export function useQueryParam(paramName) {
  const searchParams = useSearchParams();
  return searchParams.get(paramName);
}

/**
 * クエリパラメータを表示するだけのコンポーネント
 */
export function QueryParamDisplay({ param }) {
  const value = useQueryParam(param);
  return <>{value ?? ''}</>;
}
