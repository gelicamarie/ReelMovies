/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Link, useParams } from '@reach/router';
import gel from 'clsx';
import { string, arrayOf } from 'prop-types';
import { useContext, useEffect } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import { RiAddCircleLine, RiUserFollowLine, RiUserUnfollowLine } from 'react-icons/ri';
import { IoMdLogOut } from 'react-icons/io';

import useSWR, { mutate } from 'swr';
import Layout from '../../components/Layout';
import { AuthContext, AUTH_ACTIONS, parseCookies } from '../../lib/auth';
import useFollow from '../../lib/use-follow';

const MovieCard = ({
  movieId,
  title,
  posterUrl,
  director,
  releaseDate,
}) => (
  <div className="p-2" style={{ minWidth: '16rem' }}>

    <Link to={`/movies/${movieId}`}>

      <div
        className={gel(
          'h-full mx-auto',
          'border-gray-100 border-2 rounded-lg hover:border-theme-orange',
        )}
      >
        <div style={{ height: 'inherit' }} className="flex flex-col justify-between">

          <h1 className="text-3xl font-bold text-center">{title}</h1>
          <img src={posterUrl} alt={`Poster for ${title}`} />

          <div className="flex justify-between">

            <p className="text-lg ml-2 my-2">
              Director:
              {' '}
              <b>{director.map(({ _id: id, name }) => <span key={id}>{name}</span>)}</b>
              <br />
              Released on:
              {' '}
              {releaseDate}
            </p>

          </div>

        </div>
      </div>

    </Link>

  </div>
);

MovieCard.propTypes = {
  movieId: string.isRequired,
  title: string.isRequired,
  posterUrl: string.isRequired,
  director: arrayOf({}).isRequired,
  releaseDate: string.isRequired,
};

const Listings = () => {
  const { userId } = useParams();
  const { data: userData } = useSWR(`/users/${userId}`);
  const {
    state: {
      isAuthenticated,
      role,
      userId: loggedInUserId,
    }, dispatch,
  } = useContext(AuthContext);
  const follow = useFollow(userId, 'user', 'follow');
  const unfollow = useFollow(userId, 'user', 'unfollow');
  const { data: reviews } = useSWR(`/users/review/${userId}`);
  const { data: recommended } = useSWR(`/users/recommendation/${userId}`);

  useEffect(() => {
    mutate(`/users/${userId}`);
  }, [userId, role]);

  const changeRole = async () => {
    await fetch(`/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const cookies = parseCookies();
    const refreshToken = cookies['refresh-token'];
    const accessToken = cookies['access-token'];
    fetch('/users/token/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: { refresh: refreshToken, access: accessToken },
      }),
    })
      .then(() => dispatch({ type: AUTH_ACTIONS.reLogin }))
      .catch((err) => alert(err));
  };

  return (
    <Layout>

      {userData?.error && (
      <h1 className="text-center text-theme-orange text-2xl font-semibold">
        {' '}
        API returned Error:
        {userData?.error}
      </h1>
      )}

      {!userData?.error && userData && (
        <>
          {isAuthenticated && (role === 'contributing') && (
          <div className="flex justify-between">
            <div className="mb-4 text-left pr-1">
              {/* Add to Movie */}
              <Link to="/add/people">
                <RiAddCircleLine className="hover:text-theme-orange" size={30} />
              </Link>
              <h3>Add People</h3>
            </div>
            <div className="mb-4 text-right pr-1">
              {/* Add to Movie */}
              <Link
                to="/add/movies"
              >
                <RiAddCircleLine className="hover:text-theme-orange" size={30} />
              </Link>
              <h3>Add Movie</h3>
            </div>
          </div>
          )}

          <div className="py-4 pb-8 bg-theme-gelsBlue overflow-hidden sm:rounded-lg font-sans text-theme-bodyBg">

            <div className="flex justify-between px-4">
              <div className="flex">
                <div className="py-3 border-b border-theme-gelsBlue sm:px-7 text-3xl font-bold text-theme-orange">
                  {userData.username}
                </div>

                {isAuthenticated && (loggedInUserId !== userId) && (
                <div className="flex pl-3 pt-5">
                  <RiUserFollowLine className="hover:text-theme-orange" size={30} onClick={follow} />
                  <RiUserUnfollowLine className="hover:text-theme-orange" size={30} onClick={unfollow} />
                </div>
                )}
              </div>
              {isAuthenticated && (
              <div
                className={gel(
                  'my-auto',
                )}
                style={{ cursor: 'pointer' }}
                onClick={() => dispatch({ type: AUTH_ACTIONS.logout })}
              >
                <IoMdLogOut className="hover:text-theme-orange" size={30} />
              </div>
              )}
            </div>

            <div className="py-2 flex items-left font-semibold border-b border-theme-bodyBg">
              <Link className="pl-6" to={`/followers/${userId}`}>Followers</Link>
              <p className="px-4">|</p>
              <Link to={`/following/${userId}`}>Following</Link>
            </div>

            {isAuthenticated && (loggedInUserId === userId) && (
            <div className="flex justify-between pt-2 pb-2">
              <div className="pl-6 pb-2 pt-2 font-semibold text-theme-gelsWhite">{userData.role}</div>
              <div
                className="pr-6 pb-2 pt-2 text-theme-gelsWhite hover:text-theme-orange"
                onClick={() => changeRole()}
                style={{ cursor: 'pointer' }}
              >
                change role
              </div>
            </div>
            )}

            <div className="border-t-8 border-theme-bodyBg">
              <h2 className="text-3xl pt-2 pb-3 font-semibold text-left">
                Top picks for
                {' '}
                {userId === loggedInUserId ? 'you' : userData.username}
              </h2>
              <ScrollContainer nativeMobileScroll hideScrollbars style={{ cursor: "url('/cursor.png') 39 39, auto" }}>
                {recommended && (

                <div className="flex">
                  {recommended.length < 0 && (<div>Start following and liking movies</div>)}

                  {recommended.length > 0 && (
                  <>
                    {recommended.map(({
                      title, poster, _id: id, directors, releaseDate,
                    }) => (
                      <MovieCard
                        key={id}
                        movieId={id}
                        title={title}
                        posterUrl={poster}
                        director={directors}
                        releaseDate={releaseDate}
                      />
                    ))}
                  </>
                  )}
                </div>

                )}
              </ScrollContainer>
            </div>

            <div className="border-t-8 border-theme-bodyBg">

              <h2 className="text-3xl pt-2 pb-3 font-semibold text-left">Reviews</h2>

              <div className="flex-row overflow-y-scroll font-sans" style={{ maxHeight: '270px' }}>

                {reviews && reviews.length > 0 && reviews.map((a) => (
                  <div
                    key={a._id}
                    className="padding:10px border-8 border-theme-gelsBlue bg-theme-bodyBg"
                  >
                    <Link to={`/movies/${a.movie._id}`}>
                      <p className="text-2xl pb-2 pl-2 text-theme-orange font-semibold hover:text-theme-gelsBlue">{a.movie.title}</p>
                    </Link>
                    <div className="pl-4 pb-2 text-theme-gelsWhite">
                      {a.comment}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </>
      )}
    </Layout>
  );
};

export default Listings;
