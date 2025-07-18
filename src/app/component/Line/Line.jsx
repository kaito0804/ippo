'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import liff from '@line/liff';

// コンテキストの作成
const LiffContext = createContext({
  isInitialized: false,
  isLoggedIn: false,
  liffObject: null,
  error: null,
  getIdToken: async () => null,
});

// LIFFプロバイダーコンポーネント
export function LiffProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isInitialized) return;

    const myLiffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!myLiffId) {
      setError(new Error('LIFF IDが設定されていません'));
      return;
    }

    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: myLiffId });
        setIsInitialized(true);
        setIsLoggedIn(liff.isLoggedIn());
      } catch (err) {
        setError(err instanceof Error ? err : new Error('LIFF初期化エラー'));
      }
    };

    initializeLiff();
  }, [isInitialized]);

  const getIdToken = async () => {
    if (!isInitialized || !isLoggedIn) {
      return null;
    }
    try {
      return liff.getIDToken() || null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('IDトークン取得エラー'));
      return null;
    }
  };

  const contextValue = {
    isInitialized,
    isLoggedIn,
    liffObject: isInitialized ? liff : null,
    error,
    getIdToken,
  };

  return <LiffContext.Provider value={contextValue}>{children}</LiffContext.Provider>;
}

// LIFFコンテキストを使用するカスタムフック
export function useLiff() {
  const context = useContext(LiffContext);
  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffProvider');
  }
  return context;
}
