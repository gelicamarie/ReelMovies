/* eslint-disable linebreak-style */
import { useParams } from '@reach/router';
import useSwr from 'swr';
import { RiUserFollowLine, RiUserUnfollowLine } from 'react-icons/ri';
import { useContext } from 'react';
import Layout from '../../components/Layout';

import { MovieCard } from '../Movies/Listing';
import { AuthContext } from '../../lib/auth';
import useFollow from '../../lib/use-follow';

const PeopleView = () => {
  const { filmCrewId } = useParams();
  const { data: filmCrew } = useSwr(`/people/${filmCrewId}`);
  const { state: { isAuthenticated } } = useContext(AuthContext);
  const follow = useFollow(filmCrewId, 'person', 'follow');
  const unfollow = useFollow(filmCrewId, 'person', 'unfollow');

  return (
    <Layout>
      {filmCrew?.error && (
        <h1 className="text-center text-theme-orange text-2xl font-semibold">
          API returned Error:
          {filmCrew?.error}
        </h1>
      )}

      {!filmCrew?.errors && filmCrew && (
        <div className="py-4 pb-8 bg-theme-gelsBlue overflow-hidden sm:rounded-lg font-sans text-theme-bodyBg">
          <div className="flex">
            <div className="px-4 border-b border-theme-gelsBlue sm:px-7 text-3xl font-bold text-theme-orange">
              {filmCrew.name}
            </div>

            {isAuthenticated && (
            <div className="flex pr-4 pt-1">
              <RiUserFollowLine className="hover:text-theme-orange" size={30} onClick={follow} />
              <RiUserUnfollowLine className="hover:text-theme-orange" size={30} onClick={unfollow} />
            </div>
            )}
          </div>

          <div className="border-t-8 border-theme-bodyBg">
            <h2 className="text-3xl pt-2 pb-3 font-semibold text-left">
              Movies
            </h2>
            <div
              className="md:flex md:flex-wrap overflow-y-scroll"
              style={{ maxHeight: '900px', 'scrollbar-color': 'red yellow' }}
            >
              {filmCrew.movies.map(
                ({
                  title, poster, _id: id, directors, releaseDate,
                }) => (
                  <MovieCard
                    key={id}
                    movieId={`/movies/${id}`}
                    title={title}
                    posterUrl={poster}
                    director={directors}
                    releaseDate={releaseDate}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PeopleView;
