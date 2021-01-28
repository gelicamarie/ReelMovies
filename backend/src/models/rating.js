import { Schema, model } from 'mongoose';

import { ObjectReference } from '../lib/db';

const MovieRatingsSchema = new Schema({
  movie: ObjectReference('Movie'),
  like: [ObjectReference('Profiles')],
  dislike: [ObjectReference('Profiles')],
});

export default model('MovieRating', MovieRatingsSchema);
