import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

export type Role = 'OWNER' | 'STAFF';

export interface StoreInfo {
  storeId: number;
  storeMemberId: number;
  role: Role;
}

interface AuthContextType {
  storeInfo: StoreInfo | null;
  setStoreInfo: (info: StoreInfo) => void;
  fetchAndSetStoreInfo: () => Promise<StoreInfo | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [storeInfo, setStoreInfoState] = useState<StoreInfo | null>(null);

  const setStoreInfo = (info: StoreInfo) => setStoreInfoState(info);

  const fetchAndSetStoreInfo = async (): Promise<StoreInfo | null> => {
    const res = await api.get('/stores/me');
    const stores: any[] = res.data.data;
    if (!stores || stores.length === 0) return null;

    const store = stores[0];
    // TODO: 실제 응답에서 내 storeMemberId 식별 방식 확인 필요.
    // 현재는 staffList 첫 번째 항목으로 임시 처리.
    const myMember = store.staffList?.[0];
    const info: StoreInfo = {
      storeId: store.storeId,
      storeMemberId: myMember?.storeMemberId ?? 0,
      role: store.role as Role,
    };
    setStoreInfoState(info);
    return info;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    setStoreInfoState(null);
  };

  return (
    <AuthContext.Provider value={{ storeInfo, setStoreInfo, fetchAndSetStoreInfo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
