import { useContext } from 'react';
import { useToasts } from 'react-toast-notifications';
import { AuthContext } from './auth';

const useFollow = (id, type, action) => {
  const { state: { userId } } = useContext(AuthContext);
  const { addToast } = useToasts();

  const follow = async () => {
    const res = await (await fetch(`/users/${action}/${type}/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: id,
      }),
    })).json();

    addToast(res.message, {
      appearance: res.error >= 400 ? 'error' : 'info',
      autoDismiss: true,
    });
  };

  return follow;
};

export default useFollow;
