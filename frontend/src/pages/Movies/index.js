import { Router } from '@reach/router';
import { node } from 'prop-types';

import NotFound from '../NotFound';
import Listings from './Listing';
import MovieView from './View';
import EditMovie from './Edit';

const Movie = ({ children }) => <div>{children}</div>;

Movie.propTypes = {
  children: node.isRequired,
};

const Movies = () => (
  <Router>
    <NotFound default />
    <Listings path="/" />

    <Movie path=":movieId">
      <MovieView path="/" />
      <EditMovie path="/edit" />
    </Movie>

  </Router>
);

export default Movies;
