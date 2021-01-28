import { Link, useParams } from '@reach/router';
import gel from 'clsx';
import { string } from 'prop-types';
import ScrollContainer from 'react-indiana-drag-scroll';

import useSWR from 'swr';
import Layout from '../components/Layout';

export const PeopleCard = ({
  name,
  url,
}) => (
  <div className="p-2 md:w-1/4">

    <Link to={url}>
      <div
        className={gel(
          'h-48 overflow-hidden mx-auto',
          'border-theme-bodyBg border-2 rounded-lg hover:border-theme-orange',
          'lg:w-11/12 md:w-48 w-2/3 p-5',
        )}
      >
        <div style={{ maxHeight: '400px', maxWidth: '300px' }} className="flex items-center justify-center">

          <h1 className="text-3xl font-bold text-center">{name}</h1>

        </div>
      </div>

    </Link>

  </div>
);

PeopleCard.propTypes = {
  name: string.isRequired,
  url: string.isRequired,
};

const Following = () => {
  const { userId } = useParams();
  const { data } = useSWR(`/users/following/${userId}`);

  return (
    <Layout>

      {data?.error && (
      <h1 className="text-center text-theme-orange text-2xl font-semibold">
        {' '}
        API returned Error:
        {data?.error}
      </h1>
      )}

      {data && (
      <div className="py-4 pb-8 bg-theme-gelsBlue overflow-hidden sm:rounded-lg font-sans text-theme-bodyBg">
        <div className="py-3 px-4 border-b border-theme-gelsBlue sm:px-7 text-xl font-bold text-theme-orange">
          {data.name.first}
          &apos;s
          {' '}
          Following
        </div>

        <div className="border-t-8 border-theme-bodyBg pb-8">
          <h2 className="text-lg pt-2 pb-3 font-semibold text-left">Users</h2>
          <ScrollContainer nativeMobileScroll hideScrollbars style={{ cursor: "url('/cursor.png') 39 39, auto" }}>
            <div className="flex">
              {data.followingUser.map(({ _id: id, name }) => (
                <PeopleCard key={id} name={`${name.first} ${name.last}`} url={`/users/${id}`} />
              ))}
            </div>
          </ScrollContainer>
        </div>

        <div className="border-t-8 border-theme-bodyBg pb-8">
          <h2 className="text-lg pt-2 pb-3 font-semibold text-left">Film Crew</h2>
          <ScrollContainer nativeMobileScroll hideScrollbars style={{ cursor: "url('/cursor.png') 39 39, auto" }}>
            <div className="flex">
              {data.followingCrew.map(({ _id: id, name }) => (
                <PeopleCard key={id} name={name} url={`/filmcrew/${id}`} />
              ))}
            </div>
          </ScrollContainer>
        </div>

      </div>

      )}
    </Layout>
  );
};

export default Following;
