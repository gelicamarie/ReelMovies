/* eslint-disable react/jsx-one-expression-per-line */
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from '@reach/router';
import { GrFormNextLink } from 'react-icons/gr';
import gel from 'clsx';
import { arrayOf, string } from 'prop-types';
import useSwr from 'swr';
import Layout from '../../components/Layout';
import useQuery from '../../lib/use-query';

export const MovieCard = ({
  movieId,
  title,
  posterUrl,
  director,
  releaseDate,
}) => (
  <div className="p-2 md:w-1/4">
    <Link to={movieId}>
      <div
        className={gel(
          'h-full overflow-hidden mx-auto',
          'border-gray-100 border-2 rounded-lg hover:border-theme-orange',
          'lg:w-11/12 md:w-full w-2/3',
        )}
      >
        <div
          style={{ height: 'inherit' }}
          className="flex flex-col justify-between"
        >
          <h1 className="text-3xl font-bold text-center">{title}</h1>
          <img src={posterUrl} alt={`Poster for ${title}`} />

          <div className="flex justify-between">
            <p className="text-lg ml-2 my-2">
              Director:{' '}
              <b>
                {director.map(({ _id: id, name }) => (
                  <span key={id}>{name}</span>
                ))}
              </b>
              <br />
              Released on: {releaseDate}
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
  const [mounted, setMounted] = useState(true);
  const offset = useState(useQuery('offset') || 0);
  const title = useQuery('title') || undefined;
  const genre = useQuery('genre') || undefined;
  const limit = useQuery('limit') || 20;
  const apiQueryString = `/movies?limit=${limit}`;
  const queryString = useRef(apiQueryString);
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const cleanQueryParam = () => {
      if (title && genre) {
        return `${apiQueryString}&title=${title}&genre=${genre}`;
      }

      if (title) {
        return `${apiQueryString}&title=${title}`;
      }

      if (genre) {
        return `${apiQueryString}&genre=${genre}`;
      }

      return `${apiQueryString}&offset=${offset}`;
    };
    queryString.current = cleanQueryParam();
    setMounted(true);
  }, [title, genre, offset, mounted, search]);

  const { data } = useSwr(mounted ? queryString.current : null);

  const goNext = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('offset', data.pageInfo.nextOffset);
    navigate(`${url.pathname}${url.search}`, { replace: true });
    window.location.reload();
  };

  return (
    <Layout>
      {data?.error && (
        <h1 className="text-center text-theme-orange text-2xl font-semibold">
          {' '}
          API returned Error: {data?.error}
        </h1>
      )}
      {!data?.error && data && (
        <>
          <div className="md:flex md:flex-wrap">
            {data.results.map(
              ({
                title: movieTitle,
                poster,
                _id: id,
                directors,
                releaseDate,
              }) => (
                <MovieCard
                  key={id}
                  movieId={id}
                  title={movieTitle}
                  posterUrl={poster}
                  director={directors}
                  releaseDate={releaseDate}
                />
              ),
            )}
          </div>
          <br />
          <div className="flex">
            {!genre && !title && (
              <button
                type="button"
                className=" flex justify-end pt-3 mr-4 hover:text-theme-orange"
                style={{ cursor: 'pointer' }}
                onClick={goNext}
              >
                <GrFormNextLink
                  className="text-theme-gelsWhite"
                  size={40}
                />
              </button>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Listings;
