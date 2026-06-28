import { useCallback, useState } from "react";
import { getToken, setToken } from "../api/client";
import { login as loginRequest } from "../api/auth";

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(getToken());

  const login = useCallback(async (username: string, password: string) => {
    const t = await loginRequest(username, password);
    setToken(t);
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
  }, []);

  return { isAdmin: Boolean(token), login, logout };
}
