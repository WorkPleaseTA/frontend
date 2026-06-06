import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

export type Role = 'OWNER' | 'STAFF';

export interface StoreInfo {
  storeId: number;
  storeMemberId: number;
  role: Role;
  name: string;
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
    try {
      const res = await api.get('/stores/me');
      const stores: any[] = res.data.data;
      if (!stores || stores.length === 0) return null;

      const store = stores[0];
      // API 응답의 role 우선, 없으면 AsyncStorage 폴백
      const apiRole = store.role as Role | undefined;
      const savedRole = apiRole ?? (await AsyncStorage.getItem('userRole') as Role | null);
      const role = savedRole ?? 'STAFF';
      await AsyncStorage.setItem('userRole', role);
      // API 응답에 inviteCode 있으면 저장 (매장 관리 화면에서 사용)
      if (store.inviteCode) {
        await AsyncStorage.setItem('inviteCode', store.inviteCode);
      }

      const savedName = (await AsyncStorage.getItem('userName')) ?? '';
      const info: StoreInfo = {
        storeId: store.id,
        storeMemberId: store.myStoreMemberId ?? 0,
        role,
        name: savedName,
      };
      setStoreInfoState(info);
      return info;
    } catch {
      return null;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    // userRole은 제거하지 않음 — 재로그인 시 동일 계정의 role 폴백으로 사용됨
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
