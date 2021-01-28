import { Schema, model } from 'mongoose';

import { ObjectReference } from '../lib/db';

const MovieReviewSchema = new Schema({
  user: ObjectReference('Profiles'),
  movie: ObjectReference('Movie'),
  comment: {
    type: String,
    required: true,
  },
});

export default model('MovieReview', MovieReviewSchema);
