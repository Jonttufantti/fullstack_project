import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function useApiFetch() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const apiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      logout();
      navigate('/login', { replace: true });
    }

    return res;
  };

  return apiFetch;
}
