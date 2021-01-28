import { Router } from '@reach/router';

import { useContext } from 'react';
import NotFound from '../NotFound';
import AddPeople from './addPeople';
import AddMovie from './addMovie';
import Restricted from '../../components/Restricted';
import { AuthContext } from '../../lib/auth';

const AddPages = () => {
  const { state: { role } } = useContext(AuthContext);

  return (
    <Router>
      <NotFound default />
      {role === 'contributing' ? <AddMovie path="movies" /> : <Restricted path="movies" />}
      {role === 'contributing' ? <AddPeople path="people" /> : <Restricted path="people" />}
    </Router>
  );
};

export default AddPages;
