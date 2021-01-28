import { Router } from 'express';

import Movies from './movies';
import Users from './users';
import Person from './person';

const reel = Router();

reel.use('/movies', Movies);
reel.use('/users', Users);
reel.use('/people', Person);

export default reel;
