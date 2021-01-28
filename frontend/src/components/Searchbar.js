import { useEffect, useState } from 'react';
import gel from 'clsx';
import { Link } from '@reach/router';

const SearchBox = ({ ...props }) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchValue.length >= 3 && searchValue !== ' ') {
      fetch(`/movies?title=${searchValue}`)
        .then((res) => res.json())
        .then((res) => setSearchResults(res.results));
    }
  }, [searchValue]);

  return (
    <>

      <input
        className={gel('w-4/6 px-4 py-1', 'rounded-t-lg font-medium', 'text-black')}
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search Movies"
        {...props}
      />

      <div className="w-4/6 bg-white px-4 py-1 rounded-b-lg">
        {searchResults && searchResults.map(({ _id: id, title }) => (
          <ul key={id}>
            <Link to={`/movies/${id}`}>{title}</Link>
          </ul>
        ))}
      </div>

    </>
  );
};

export default SearchBox;
