/* eslint-disable no-underscore-dangle */
import { useContext, useEffect } from 'react';
import useAPIPolling from 'use-api-polling';
import { node } from 'prop-types';
import { useToasts } from 'react-toast-notifications';
import { AuthContext } from '../lib/auth';

const NotificationsWrapper = ({ children }) => {
  const { state: { userId, isAuthenticated } } = useContext(AuthContext);
  const fetchFunc = async () => {
    if (isAuthenticated) {
      const notifs = await (await fetch(`/users/notifications/${userId}`)).json();
      return notifs;
    }
    return [];
  };
  const { addToast } = useToasts();
  const options = {
    fetchFunc,
    initialState: [],
    delay: 2000,
  };

  const removeNotifs = async (id) => {
    await (await fetch(`/users/notifications/read/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })).json();
  };

  const data = useAPIPolling(options);

  useEffect(() => {
    if (data) {
      if (data.length > 0) {
        data.forEach((a) => {
          addToast(a.message, {
            appearance: 'info',
            autoDismiss: false,
            onDismiss: () => removeNotifs(a._id),
          });
        });
      }
    }
  }, [data, isAuthenticated]);

  return (
    <>
      {children}
    </>
  );
};

NotificationsWrapper.propTypes = {
  children: node.isRequired,
};

export default NotificationsWrapper;
