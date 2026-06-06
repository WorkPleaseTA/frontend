import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://workmanager.store',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const { data } = await axios.post('https://workmanager.store/auth/reissue', { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data.data;
        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', newRefresh],
        ]);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api.request(original);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
