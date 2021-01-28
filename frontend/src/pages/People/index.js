import { Router } from '@reach/router';
import { node } from 'prop-types';

import NotFound from '../NotFound';
import PeopleView from './View';
import Listings from './Listings';

const Person = ({ children }) => <div>{children}</div>;

Person.propTypes = {
  children: node.isRequired,
};

const People = () => (
  <Router>
    <NotFound default />
    <Listings path="/" />

    <Person path=":filmCrewId">
      <PeopleView path="/" />
    </Person>

  </Router>
);

export default People;
