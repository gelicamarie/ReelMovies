import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from '@reach/router';
import gel from 'clsx';
import { GrFormNextLink } from 'react-icons/gr';
import { string } from 'prop-types';
import useSwr from 'swr';
import Layout from '../../components/Layout';
import useQuery from '../../lib/use-query';

export const PeopleCard = ({ name, id }) => (
  <div className="p-2 md:w-1/4">
    <Link to={id}>
      <div
        className={gel(
          'h-full overflow-hidden mx-auto',
          'border-theme-bodyBg border-2 rounded-lg hover:border-theme-orange',
          'lg:w-11/12 md:w-full w-2/3',
        )}
      >
        <div
          style={{ height: '20rem' }}
          className="flex items-center justify-center"
        >
          <h1 className="text-3xl font-bold text-center">{name}</h1>
        </div>
      </div>
    </Link>
  </div>
);

PeopleCard.propTypes = {
  name: string.isRequired,
  id: string.isRequired,
};

const Listings = () => {
  const offset = useState(useQuery('offset') || 10);
  const queryString = useRef('/api/people?limit=20');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cleanQueryParam = () => `/people?limit=20&offset=${offset}`;
    queryString.current = cleanQueryParam();
    setMounted(true);
  }, [offset, mounted]);

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
          API returned Error:
          {data?.error}
        </h1>
      )}

      {!data?.error && data && (
        <div className="py-4 pb-8 bg-theme-gelsBlue overflow-hidden sm:rounded-lg font-sans text-theme-bodyBg">
          <div className="px-4 border-b border-theme-gelsBlue sm:px-7 text-3xl font-bold text-theme-orange">
            Film Production
          </div>
          <div className="md:flex md:flex-wrap overflow-y-scroll">
            {data.results.map(({ _id, name }) => (
              <PeopleCard key={_id} id={_id} name={name} />
            ))}
          </div>
          <div className="flex justify-end pt-3 mr-4 hover:text-theme-orange" style={{ cursor: 'pointer' }}>
            <button type="button" onClick={goNext}>
              <GrFormNextLink size={40} className="hover:text-theme-orange" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Listings;
