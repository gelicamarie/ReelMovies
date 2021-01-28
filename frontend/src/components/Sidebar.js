/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useContext, useState } from 'react';
import { Link } from '@reach/router';
import gel from 'clsx';
import { bool, string } from 'prop-types';
import useSWR from 'swr';
import { AuthContext } from '../lib/auth';

const MenuItem = ({ href, label, customClass }) => (
  <Link
    className={gel(
      'block text-2xl px-4 py-1 hover:text-theme-orange',
      customClass,
    )}
    to={href}
  >
    {label}
  </Link>
);

MenuItem.propTypes = {
  href: string.isRequired,
  label: string.isRequired,
  customClass: string,
};

MenuItem.defaultProps = {
  customClass: undefined,
};

const Sidebar = ({ showLogin, showLogo }) => {
  const [nav, setNav] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { state: { isAuthenticated, userId, username } } = useContext(AuthContext);
  const { data: genres } = useSWR('/movies/genres');

  return (
    <>
      <nav className="flex items-center justify-between">
        <div className="flex">
          <div
            style={{ cursor: 'pointer' }}
            className="text-theme-orange text-2xl px-4 py-2 hover:bg-gray-100 my-auto"
            onClick={() => setNav(!nav)}
          >
            ☰
          </div>

          {showLogo && (
            <Link to="/">
              <img className="flex -mt-4" style={{ width: '130px' }} src="/logo.png" alt="logo" />
            </Link>
          )}

        </div>

        {showLogin && !isAuthenticated && (
        <div className="flex items-left pr-4">
          <Link to="/login" className="px-2">Login</Link>
          <p className="px-2">|</p>
          <Link to="/signup" className="pl-2">Sign Up</Link>
        </div>
        )}

        {isAuthenticated && (
          <div className="flex items-left pr-6 -mt-4">
            <Link to={`/users/${userId}`} className="hover:text-theme-orange text-semibold text-lg">{username}</Link>
          </div>
        )}

      </nav>

      {nav && (
        <div className="h-full top-0 left-0 pt-8 z-10 overflow-x-hidden fixed bg-theme-gelsWhite text-black">
          <div
            className="absolute text-3xl top-0 pl-40 ml-4 hover:text-theme-orange"
            style={{ cursor: 'pointer' }}
            onClick={() => setNav(!nav)}
          >
            ×
          </div>

          <MenuItem href="/" label="Home" />
          <MenuItem href="/movies" label="Movies By Title" />

          <div
            className="block text-2xl px-4 py-1 hover:text-theme-orange"
            style={{ cursor: 'pointer' }}
            onClick={() => setDropdown(!dropdown)}
          >
            Movies By Genre
          </div>

          {dropdown && (
            <div>
              {genres && genres.names.map((a) => (
                <MenuItem
                  href={`/movies?genre=${a}`}
                  key={a}
                  label={a}
                />
              ))}
            </div>
          )}
          <MenuItem href="/filmcrew" label="Film Production Team" />
        </div>
      )}
    </>
  );
};

Sidebar.propTypes = {
  showLogin: bool.isRequired,
  showLogo: bool.isRequired,
};

export default Sidebar;
