import { useReducer, useEffect } from 'react';
import { Router } from '@reach/router';
import { ToastProvider } from 'react-toast-notifications';
import {
  AuthContext, authReducer, AUTH_ACTIONS, initialAuthState,
} from './lib/auth';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import Movies from './pages/Movies';
import Users from './pages/Users';
import Followers from './pages/Followers';
import Following from './pages/Following';
import People from './pages/People';
import Add from './pages/Add';
import NotificationsWrapper from './components/NotificationsWrapper';

const Routes = () => (
  <Router>
    <NotFound default />
    <Home path="/" />
    <Movies path="movies/*" />
    <Users path="users/*" />
    <Login path="login" />
    <Signup path="signup" />
    <Followers path="followers/:userId" />
    <Following path="following/:userId" />
    <People path="filmcrew/*" />
    <Add path="add/*" />
  </Router>
);

const App = () => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    dispatch({ type: AUTH_ACTIONS.reLogin });
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      <ToastProvider
        autoDismiss
        autoDismissTimeout={6000}
        placement="top-right"
      >
        <NotificationsWrapper>
          <Routes />
        </NotificationsWrapper>
      </ToastProvider>
    </AuthContext.Provider>
  );
};

export default App;
