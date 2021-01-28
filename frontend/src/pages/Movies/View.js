/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-one-expression-per-line */
import { useContext, useState } from 'react';
import { useParams, Link } from '@reach/router';
import useSwr, { mutate } from 'swr';
import ReactJoin from 'react-join';
import gel from 'clsx';
import { FaRegSmileBeam, FaRegSadTear } from 'react-icons/fa';
import { RiAddCircleLine } from 'react-icons/ri';
import { AiTwotoneEdit } from 'react-icons/ai';
import ReactStars from 'react-rating-stars-component';

import { useToasts } from 'react-toast-notifications';
import Layout from '../../components/Layout';
import { AuthContext } from '../../lib/auth';
import useReaction from '../../lib/use-reaction';

const Reactions = () => {
  const { movieId } = useParams();
  const like = useReaction(movieId, 'like');
  const dislike = useReaction(movieId, 'dislike');

  return (
    <div className="flex">
      <button type="button" onClick={like}>
        <FaRegSmileBeam className="hover:text-theme-orange" size={30} />
      </button>

      <button type="button" onClick={dislike}>
        <FaRegSadTear className="hover:text-theme-orange" size={30} />
      </button>
    </div>
  );
};

const MovieView = () => {
  const { movieId } = useParams();
  const { data } = useSwr(`/movies/${movieId}`);
  const [review, setReview] = useState('');
  const {
    state: { isAuthenticated, role, userId },
  } = useContext(AuthContext);
  const { addToast } = useToasts();
  const { data: reviewData } = useSwr(`/movies/review/${movieId}`);

  const setStars = async (score) => {
    if (isAuthenticated) {
      await (
        await fetch(`/movies/score/${movieId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score,
          }),
        })
      ).json();
    }
  };

  return (
    <Layout>
      {data?.error && (
        <h1 className="text-center text-theme-orange text-2xl font-semibold">
          API returned Error: {data?.error}
        </h1>
      )}

      {!data?.error && data && (
        <>
          {isAuthenticated && role === 'contributing' && (
            <div className="flex justify-end pb-2">
              <Link to="edit">
                <AiTwotoneEdit className="hover:text-theme-orange" size="25" />
              </Link>
            </div>
          )}
        </>
      )}

      {!data?.error && data && (
        <div className="mb-16 bg-theme-gelsBlue overflow-hidden sm:rounded-lg font-sans text-theme-bodyBg">
          <div className="flex p-6 pr-2">
            <img
              style={{ height: '20rem' }}
              src={data.poster}
              alt={data.title}
            />

            <div className="pl-6 w-full text-xl text-theme-bodyBg font-semibold">
              <div className="flex justify-between">
                <h1 className="text-4xl font-semibold text-theme-orange">
                  {data.title}
                </h1>
                {isAuthenticated && (
                  <div className="flex justify-end pb-2">
                    <Reactions />
                  </div>
                )}
              </div>

              <h3 className="pb-4 font-light text-lg font-mono">
                {[data.rated, data.runtime].reduce(
                  (a, b) => `${a} | ${b}`,
                )}
                {' '}|{' '}
                <ReactJoin separator={<span> | </span>}>
                  {data.genre.map((a) => <Link key={a} to={`/movies?genre=${a}`}>{a}</Link>)}
                </ReactJoin>
              </h3>
              <h3>
                Director:{' '}
                {data.directors.map(({ _id: id, name }) => (
                  <Link to={`/filmcrew/${id}`} key={id}>
                    {name}
                  </Link>
                ))}
              </h3>
              <h3>
                Writers:{' '}
                <ReactJoin>
                  {data.writers.map(({ _id: id, name }) => (
                    <Link to={`/filmcrew/${id}`} key={id}>
                      {name}
                    </Link>
                  ))}
                </ReactJoin>
              </h3>
              <h3>
                Actors:{' '}
                <ReactJoin>
                  {data.actors.map(({ _id: id, name }) => (
                    <Link to={`/filmcrew/${id}`} key={id}>
                      {name}
                    </Link>
                  ))}
                </ReactJoin>
              </h3>
              <h3 className="text-lg">
                Awards:{' '}
                <span className="text-theme-gelsWhite font-light">
                  {data.awards}
                </span>
              </h3>
            </div>
          </div>

          <div className="px-6 pt-3 border-t-8 border-theme-bodyBg  text-theme-orange font-semibold">
            <h1 className="text-2xl">Plot</h1>
            <div className="pl-8 pb-2 font-light text-theme-gelsWhite">
              {data.plot}
            </div>
          </div>

          <div className="border-t-8 pb-6 border-theme-bodyBg">
            <div className="flex justify-between">
              <h2 className="text-3xl pt-2 pb-3 font-semibold text-left">
                Reviews
              </h2>

              {isAuthenticated && (
                <>
                  <div className="flex justify-end pb-2">
                    <div className="pt-4 pr-4">
                      <ReactStars
                        count={10}
                        onChange={(newRating) => setStars(newRating)}
                        size={24}
                        value={Math.round(data.averageScore)}
                        activeColor="#933a16"
                        color="#8496b5"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {isAuthenticated && (
              <>
                <textarea
                  className="pl-2 border-8 text-theme-gelsWhite border-theme-gelsBlue bg-theme-bodyBg w-full h-24"
                  placeholder="Write review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />

                <div className="pr-2">
                  <button
                    type="submit"
                    className={gel('float-right')}
                    value="Submit"
                    onClick={async () => {
                      const res = await (
                        await fetch(`/movies/review/${movieId}`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            comment: review,
                            user: userId,
                          }),
                        })
                      ).json();
                      setReview('');
                      mutate(`/movies/review/${movieId}`);
                      addToast(
                        res.error >= 400
                          ? res.message
                          : 'Thanks for the review!',
                        {
                          appearance: res.error >= 400 ? 'error' : 'info',
                          autoDismiss: true,
                        },
                      );
                    }}
                  >
                    <RiAddCircleLine
                      className="hover:text-theme-orange"
                      size={30}
                    />
                  </button>
                </div>
                <br />
                <br />
              </>
            )}

            <div
              className="flex-row overflow-y-scroll fosnt-sans"
              style={{ maxHeight: '270px' }}
            >
              {reviewData
                && reviewData.length > 0
                && reviewData.map(({ _id: id, user, comment }) => (
                  <div
                    key={id}
                    className="border-8 border-theme-gelsBlue bg-theme-bodyBg"
                  >
                    <Link to={`/users/${user._id}`}>
                      <p className="pl-2 text-theme-gelsBlue hover:text-theme-orange">
                        {user.name.first} {user.name.last}
                      </p>
                    </Link>

                    <div className="pl-4 pb-2 text-theme-gelsWhite">
                      {comment}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MovieView;
