import { Router } from '@reach/router';

import NotFound from '../NotFound';
import Listings from './Listing';

const Users = () => (
  <Router>
    <NotFound default />
    <Listings path=":userId" />
  </Router>
);

export default Users;
