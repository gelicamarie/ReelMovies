import { useContext } from 'react';
import { useToasts } from 'react-toast-notifications';
import { AuthContext } from './auth';

const useReaction = (movieId, action) => {
  const { state: { userId } } = useContext(AuthContext);
  const { addToast } = useToasts();

  const reaction = async () => {
    const res = await (await fetch(`/movies/${action}/${movieId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: userId,
      }),
    })).json();

    addToast(res.message, {
      appearance: res.error >= 400 ? 'error' : 'info',
      autoDismiss: true,
    });
  };

  return reaction;
};

export default useReaction;
