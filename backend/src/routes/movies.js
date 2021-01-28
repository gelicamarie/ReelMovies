/* eslint-disable no-underscore-dangle */
import { Router } from 'express';
import Model from '../models';

const router = Router();

/**
 * Return a number satisfying upper bounds
 * @param input
 * @param def default value
 * @param max upper bound
 */
export const BoundCheck = (input, def, max) => {
  if (max) {
    if (input > max) return def;
  }

  if (input > 0) return input;
  return def;
};

/**
 * Cleanup a string
 * @param text input to process
 * StackOverflow
 */
export const EscapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

/*
  Get all movies
  Search parameters:
    - title
    - genre
    - year
     - minrating
 */
router.get('/', async ({ query }, res, next) => {
  try {
    const limit = BoundCheck(parseInt(query.limit, 10), 20, 100);
    const offset = BoundCheck(parseInt(query.offset, 10), 0);

    const searchParams = {};

    if (query.year) {
      searchParams.year = query.year;
    }

    if (query.title) {
      searchParams.title = new RegExp(EscapeRegex(query.title), 'gi');
    }

    if (query.genre) {
      searchParams.genre = query.genre;
    }

    if (query.minrating) {
      searchParams.averageScore = { $gte: query.minrating };
    }

    const movies = await Model.Movie.find(
      searchParams,
      null,
      {
        sort: { title: 1 },
        skip: offset,
        limit,
      },
    ).populate('directors');

    const upperbound = await Model.Movie.count();

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

// gets list of movie genres
router.get('/genres', async (_, res) => {
  const genreSet = new Set();
  const genres = await Model.Movie.find().select('genre');

  genres.forEach(({ genre }) => genre.map((a) => genreSet.add(a)));

  res.json({ count: genreSet.size, names: [...genreSet] });
});

// Get a single with an ID
router.get('/:movie', async ({ params: { movie } }, res, next) => {
  try {
    const singleMovie = await Model.Movie.findById(movie).populate('writers actors directors');
    if (singleMovie) return res.json(singleMovie);
    return next({ message: `${movie} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

// // Update a movie
// router.patch('/:movie', async ({ params: { movie }, body }, res, next) => {
//   try {
//     const singleMovie = await Model.Movie.findById(movie);
//     if (singleMovie) {
//       const people = [...List(body.directors), ...List(body.actors), ...List(body.writers)];

//       const searchPeople = await Promise.all(
//         people.map((a) => Model.Person.findOne({ name: a }).select('name')),
//       );

//       if (searchPeople.find((v) => v === null) === null) {
//         return next({ message: 'Person does not exist in database.
//  Add them and comeback.', status: 400 });
//       }

//       const dirs = searchPeople.slice(0, body.directors.length);

//       const actors = searchPeople.slice(
//         body.directors.length,
//         body.directors.length + body.actors.length,
//       );

//       const writers = searchPeople.slice(
//         body.directors.length + body.actors.length,
//         body.directors.length + body.actors.length + body.writers.length,
//       );

//       const update = await Model.Movie.findByIdAndDelete(
//         { _id: movie },
//         {
//           $set: {
//             title: body.title,
//             genre: body.genre,
//             plot: body.plot,
//             releaseDate: body.releaseDate,
//             directors: dirs.map((a) => a._id),
//             actors: actors.map((a) => a._id),
//             writers: writers.map((a) => a._id),
//           },
//         },
//       ).exec();

//       return res.json(update);
//     }
//     return next({ message: `${movie} does not exist`, status: 404 });
//   } catch (err) { return next(err); }
// });

// add a movie
router.post('/', async ({ body }, res, next) => {
  try {
    const validateTitle = await Model.Movie.find({ title: body.title }).countDocuments() > 0;

    if (validateTitle) return next({ message: `Movie with ${body.title} already exists`, status: 400 });

    const people = [...body.directors, ...body.actors, ...body.writers];

    const searchPeople = await Promise.all(
      people.map((a) => Model.Person.findOne({ name: a }).select('name follower')),
    );

    if (searchPeople.filter(Boolean).length !== people.length) {
      return next({ message: 'Person does not exist in database. Add them and comeback.', status: 400 });
    }

    const dirs = searchPeople.slice(0, body.directors.length);

    const actors = searchPeople.slice(
      body.directors.length,
      body.directors.length + body.actors.length,
    );

    const writers = searchPeople.slice(
      body.directors.length + body.actors.length,
      body.directors.length + body.actors.length + body.writers.length,
    );

    const newMovie = new Model.Movie({
      title: body.title,
      genre: body.genre,
      plot: body.plot,
      releaseDate: body.releaseDate,
      directors: dirs.map((a) => a._id),
      actors: actors.map((a) => a._id),
      writers: writers.map((a) => a._id),
    });

    const saveMovie = await newMovie.save();

    // add movie to directors writers and actors: 
    await Promise.all(dirs.map(async (a) => Model.Person.findByIdAndUpdate(
      { _id: a._id },
      { $push: { director: saveMovie._id } },
    )));
    await Promise.all(actors.map(async (a) => Model.Person.findByIdAndUpdate(
      { _id: a._id },
      { $push: { actor: saveMovie._id } },
    )));
    await Promise.all(writers.map(async (a) => Model.Person.findByIdAndUpdate(
      { _id: a._id },
      { $push: { writer: saveMovie._id } },
    )));

    // Sending user notifications about people's new movie
    await Promise.all(
      searchPeople.map(({ name, follower }) => follower.map(async (id) => new Model.Notifications({
        to: id,
        message: `${name} took part in ${saveMovie.title}`,
        movie: saveMovie._id,
      }).save())),
    );

    return res.status(200).json(newMovie);
  } catch (err) { return next(err); }
});

// Writing reviews
router.post('/review/:movie', async ({ params: { movie }, body }, res, next) => {
  try {
    const movieObj = await Model.Movie.findById(movie);
    const user = await Model.User.findById(body.user).select('follower name');

    if (movieObj && user) {
      const review = await new Model.MovieReview(
        { user: body.user, comment: body.comment, movie },
      ).save();

      await Model.Movie.findByIdAndUpdate(
        { _id: movie },
        { $push: { reviews: review } },
      ).exec();

      //send notification to user if follower made a review
      await Promise.all(user.follower.map(async (id) => new Model.Notifications({
        to: id,
        message: `${user.name.first} ${user.name.last} just added a review for ${movieObj.title}`,
        movie: movieObj._id,
      }).save()));

      return res.json(review);
    }

    return next({ message: 'Either movie or user does not exist', status: 404 });
  } catch (err) { return next(err); }
});

// Getting reviews on specific movies
router.get('/review/:movie', async ({ params: { movie } }, res, next) => {
  try {
    const review = await Model.MovieReview.find({ movie }).populate('user');

    if (review) {
      if (review.length >= 1) {
        return res.json(review.reverse());
      }
    }

    return next({ message: `Review for ${movie} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

//Liking a movie
router.patch('/like/:movie', async ({ params: { movie }, body }, res, next) => {
  if (!body.user) return next({ message: '`user` is a required field.', status: 412 });

  try {
    const movieObj = await Model.Movie.findById(movie);
    const user = await Model.User.findById(body.user);

    if (movieObj && user) {
      const rateMe = await Model.MovieRating.findOne({ movie });

      // Create new
      if (!rateMe) {
        const rating = await new Model.MovieRating({
          movie,
          like: [body.user],
        }).save();

        // Add movie to collection
        await Model.Movie.findByIdAndUpdate(
          { _id: movieObj._id },
          { $set: { ratings: rating } },
        ).exec();

        // Update the current user
        await Model.User.findByIdAndUpdate(
          { _id: body.user },
          { $push: { likes: movieObj._id } },
        ).exec();

        return res.json({ message: `Like ${movieObj.title}` });
      }

      const disliked = await Model.MovieRating
        .findById({ _id: rateMe._id })
        .where('dislike').equals(body.user);

      if (disliked) {
        await Model.MovieRating.findOneAndUpdate(
          { _id: rateMe._id },
          { $pullAll: { dislike: [body.user] } },
        ).exec();

        await Model.User.findByIdAndUpdate(
          { _id: body.user },
          { $pullAll: { dislikes: [movieObj._id] } },
        ).exec();
      }

      const shouldTheyLike = await Model.MovieRating
        .findById({ _id: rateMe._id })
        .where('like').ne(body.user);

      // Already liked
      if (!shouldTheyLike) {
        return res.json({ message: 'You already liked this movie :).' });
      }

      await Model.MovieRating.findByIdAndUpdate(
        { _id: rateMe._id },
        { $push: { like: body.user } },
      ).exec();

      await Model.User.findByIdAndUpdate(
        { _id: body.user },
        { $push: { likes: movieObj._id } },
      ).exec();

      return res.json({ message: `Like ${movieObj.title}` });
    }

    return next({ message: 'User/Movie not found', status: 404 });
  } catch (err) { return next(err); }
});

// unliking a movie
router.patch('/dislike/:movie', async ({ params: { movie }, body }, res, next) => {
  if (!body.user) return next({ message: '`user` is a required field.', status: 412 });

  try {
    const movieObj = await Model.Movie.findById(movie);
    const user = await Model.User.findById(body.user);

    if (movieObj && user) {
      const rateMe = await Model.MovieRating.findOne({ movie });

      // Create new
      if (!rateMe) {
        const rating = await new Model.MovieRating({
          movie,
          dislike: [body.user],
        }).save();

        // Adding movie to collection
        await Model.Movie.findByIdAndUpdate(
          { _id: movieObj._id },
          { $set: { ratings: rating } },
        ).exec();

        // Update the current user
        await Model.User.findByIdAndUpdate(
          { _id: body.user },
          { $push: { dislike: movieObj._id } },
        ).exec();

        return res.json({ message: `Disliked ${movieObj.title}` });
      }

      const liked = await Model.MovieRating
        .findById({ _id: rateMe._id })
        .where('like').equals(body.user);

      if (liked) {
        await Model.MovieRating.findOneAndUpdate(
          { _id: rateMe._id },
          { $pullAll: { like: [body.user] } },
        ).exec();

        await Model.User.findByIdAndUpdate(
          { _id: body.user },
          { $pullAll: { likes: [movieObj._id] } },
        ).exec();
      }

      const shouldTheyDislike = await Model.MovieRating
        .findById({ _id: rateMe._id })
        .where('dislike').ne(body.user);

      // Already unliked
      if (!shouldTheyDislike) {
        return res.json({ message: 'We get it. You dont like this movie :(' });
      }

      await Model.MovieRating.findByIdAndUpdate(
        { _id: rateMe._id },
        { $push: { dislike: body.user } },
      ).exec();

      // Add to user
      await Model.User.findByIdAndUpdate(
        { _id: body.user },
        { $push: { dislikes: movieObj._id } },
      ).exec();

      return res.json({ message: `Disliked ${movieObj.title}` });
    }

    return next({ message: 'User/Movie not found', status: 404 });
  } catch (err) { return next(err); }
});

// Rating a movie
router.patch('/score/:movie', async ({ params: { movie }, body }, res, next) => {
  try {
    if (!body.score) return next({ message: '`score` is a required field.', status: 412 });
    if (body.score > 10 || body.score < 0) return next({ message: '`score` needs to be between 0-10.', status: 412 });

    const singleMovie = await Model.Movie.findById(movie);
    if (singleMovie) {
      const newScore = singleMovie.score + +body.score;
      const newScoreCounter = singleMovie.scoreCounter + 1;
      const avgScore = newScore / newScoreCounter;

      await Model.Movie.findByIdAndUpdate(
        { _id: movie },
        {
          $set: {
            scoreCounter: newScoreCounter,
            score: newScore,
            averageScore: avgScore,
          },
        },
      ).exec();

      return res.json({ message: `Average score is ${avgScore}` });
    }
    return next({ message: `${movie} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

export default router;
