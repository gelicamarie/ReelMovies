import { createContext } from 'react';
import jwtDecode from 'jwt-decode';

export const AUTH_ACTIONS = {
  login: 'LOGIN',
  reLogin: 'RE_LOGIN',
  logout: 'LOGOUT',
};

export const initialAuthState = {
  isAuthenticated: false,
  userId: undefined,
  role: undefined,
  username: undefined,
};

export const AuthContext = createContext({ state: initialAuthState });

export const parseCookies = () => document.cookie.split(';').reduce((res, c) => {
  const [key, val] = c.trim().split('=').map(decodeURIComponent);
  try {
    return Object.assign(res, { [key]: JSON.parse(val) });
  } catch (e) {
    return Object.assign(res, { [key]: val });
  }
}, {});

const deleteAllCookies = () => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i += 1) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.login: {
      const cookies = parseCookies();
      const accessToken = cookies['access-token'];
      if (!accessToken) return state;
      const { userId, role, username } = jwtDecode(accessToken);
      return {
        isAuthenticated: true,
        userId,
        role,
        username,
      };
    }
    case AUTH_ACTIONS.reLogin: {
      const cookies = parseCookies();
      const refreshToken = cookies['refresh-token'];
      if (!refreshToken) return state;
      const { userId, role, username } = jwtDecode(refreshToken);
      return {
        isAuthenticated: true,
        userId,
        role,
        username,
      };
    }
    case AUTH_ACTIONS.logout: {
      deleteAllCookies();
      window.location.assign('/');
      return initialAuthState;
    }
    default:
      return state;
  }
};
