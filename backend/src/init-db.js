import mongoose, { Model, Types } from 'mongoose';
import { camelCase } from 'lodash';
// import data from '../movie-data.json';
import data from '../movie-data-short.json';
import { List, StripParens } from './lib/utils';
import Models from './models';

const imdbCollection = ['imdbId', 'imdbRating', 'imdbVotes'];

const includeInMovies = [
  'plot',
  'language',
  'country',
  'released',
  'metascore',
  'awards',
  'runtime',
  'genre',
  'title',
  'director',
  'writer',
  'actors',
  'poster',
  'production',
  'rated',
  'year',
  ...imdbCollection,
];

const people = ['writer', 'director', 'actors'];

const moviesCollection = (topLevelFilters) => {
  data.map(async (obj) => {
    let temp = {};
    let imdbTemp = {};
    // Top Level stuff
    Object.keys(obj)
      .filter((key) => topLevelFilters.includes(camelCase(key)))
      .forEach((key) => {
        if (imdbCollection.includes(camelCase(key))) {
          imdbTemp = {
            ...imdbTemp,
            [camelCase(key)]: obj[key],
          };

          temp = {
            ...temp,
            imdb: {
              ...imdbTemp,
            },
          };
        } else {
          temp = {
            ...temp,
            [camelCase(key)]: obj[key],
          };
        }
      });

    const movie = new Models.Movie({
      title: temp.title,
      releaseDate: temp.released,
      rated: temp.rated,
      runtime: temp.runtime,
      genre: List(temp.genre),
      plot: temp.plot,
      language: temp.language,
      country: temp.country,
      metaScore: temp.metascore === 'N/A' ? 0 : parseInt(temp.metascore),
      awards: temp.awards,
      imdb: {
        id: temp.imdb.imdbId,
        votes: parseInt(temp.imdb.imdbVotes),
        rating: temp.imdb.imdbRating,
      },
      poster: temp.poster,
      production: temp.production || 'N/A',
      directors: List(temp.director).map((word) => StripParens(word)),
      actors: List(temp.actors).map((word) => StripParens(word)),
      writers: List(temp.writer).map((word) => StripParens(word)),
      year: temp.year,
    });

    const saveMovie = await movie.save();
    console.log(`Inserted movie ${saveMovie.title} : ${saveMovie._id}`);
  });
};

const personCollection = (people) => {
  let ctr = 0;
  data.map(async (obj) => {
    let temp = {};
    Object.keys(obj)
      .filter((key) => people.includes(camelCase(key)))
      .forEach((key) => {
        temp = {
          ...temp,
          [camelCase(key)]: List(obj[key]).map((a) => StripParens(a)),
        };
      });

    [...temp.director, ...temp.writer, ...temp.actors].map(async (name) => {
      try {
        const searchPerson = await Models.Person.find({ name });
        await new Promise((a) => setTimeout(a, 80));
        if (searchPerson.length == 0) {
          const person = await new Models.Person({ name }).save();
          console.log(`${ctr} Inserted ${name} with ID ${person._id}`);
          ctr++;
        } else {
          console.log(`${name} exists!`);
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
};

const relateMovieToPersons = async (movieKey, personKey) => {
  const movies = await Models.Movie.find();
  movies.map((a) => {
    const tempId = [];

    Promise.all(
      a[movieKey].map(
        async (name) => await Models.Person.findOneAndUpdate(
          { name },
          { $push: { [personKey]: a._id } },
        ).exec(),
      ),
    ).then(async (b) => {
      b.map((x) => tempId.push(x._id));
      await Models.Movie.updateOne(
        { _id: a._id },
        { $set: { [movieKey]: tempId } },
      ).exec();
      console.log(`Updated ${movieKey} ${a.title}`);
    });
  });
};

const updateObjectId = async (key) => {
  const movies = await Models.Movie.find();
  movies.map(async (a) => {
    const tempId = [];
    a[key].map((b) => tempId.push(mongoose.Types.ObjectId(b)));
    await Models.Movie.updateOne(
      { _id: a._id },
      { $set: { [key]: tempId } },
    ).exec();
    console.log(`Updated ${key} ${a.title}`);
  });
};

const start = async () => {
  // Connect to DB
  try {
    await mongoose.connect('mongodb://localhost:27017/geldb', {
      useNewUrlParser: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log(err);
    console.error('Unable to connect to MongoDB');
    process.exit(126);
  }
  // moviesCollection(includeInMovies);
  // personCollection(people);
  // relateMovieToPersons('actors', 'actor');
  // relateMovieToPersons('directors', 'director');
  // relateMovieToPersons('writers', 'writer');
  // updateObjectId('actors');
  // updateObjectId('directors');
  // updateObjectId('writers');
};

start();
