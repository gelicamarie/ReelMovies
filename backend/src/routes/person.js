import { Router } from 'express';

import Models from '../models';
import { BoundCheck, EscapeRegex } from './movies';

const router = Router();

/*
 * Getting all people (writers, actors, directors)
 */
router.get('/', async ({ query }, res, next) => {
  try {
    const limit = BoundCheck(parseInt(query.limit, 10), 20, 100);
    const offset = BoundCheck(parseInt(query.offset, 10), 0);

    const searchParams = {};

    const movies = await Models.Person.find(
      searchParams,
      null,
      {
        sort: { name: 1 },
        skip: offset,
        limit,
      },
    ).populate('directors');

    const upperbound = await Models.Person.count();

    let nextOffset = offset + limit;
    if (nextOffset > upperbound) {
      nextOffset = limit;
    }

    return res.json({
      pageInfo: {
        limit,
        nextOffset,
      },
      results: movies,
    });
  } catch (err) { return next(err); }
});

/*
  Getting a specific director/actor/writer
 */
router.get('/:personId', async ({ params: { personId } }, res, next) => {
  try {
    const person = await Models.Person.findById(personId);

    if (person) {
      const moviesSet = new Set();
      [...person.director, ...person.writer, ...person.actor]
        .map((id) => moviesSet.add(id.toString()));

      const tempMovies = await Promise.all(
        [...moviesSet].map(async (id) => Models.Movie.findById(id).populate('directors')),
      );

      return res.json({ name: person.name, movies: tempMovies, _id: personId });
    }

    return next({ message: `${personId} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

/**
 * Adding a person to the database
 *  - name: string
 *  - role: director, actor, or writer
 */
router.post('/', async ({ body }, res, next) => {
  try {
    const person = new Models.Person({ ...body });
    const savePerson = await person.save();
    return res.json(savePerson.toJSON());
  } catch (err) { return next(err); }
});

export default router;
