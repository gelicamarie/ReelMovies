import { Schema, model } from 'mongoose';

import { ObjectReference } from '../lib/db';

const PersonSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  director: [ObjectReference('Movie', false)],
  writer: [ObjectReference('Movie', false)],
  actor: [ObjectReference('Movie', false)],
  follower: [ObjectReference('Profiles', false)],
});

export default model('Person', PersonSchema);
