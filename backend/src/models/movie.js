import { Schema, model } from 'mongoose';

import { ObjectReference } from '../lib/db';

const MovieSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: true,
  },
  releaseDate: String,
  rated: String,
  runtime: String,
  genre: [
    {
      type: String,
      required: true,
      index: true,
    },
  ],
  plot: String,
  language: String,
  country: String,
  metaScore: Number,
  awards: String,
  imdb: {
    id: String,
    votes: Number,
    rating: Number,
  },
  poster: String,
  production: String,
  score: {
    type: Number,
    default: 0,
    required: true,
  },
  scoreCounter: {
    type: Number,
    default: 0,
    required: true,
  },
  averageScore: {
    type: Number,
    default: 0,
    maxlength: 10,
    required: true,
  },
  reviews: [ObjectReference('MovieReview')],
  ratings: ObjectReference('MovieRating', false),
  // directors: [String],
  // actors: [String],
  // writers: [String],
  directors: [ObjectReference('Person')],
  actors: [ObjectReference('Person')],
  writers: [ObjectReference('Person')],
  year: String,
});

export default model('Movie', MovieSchema);
