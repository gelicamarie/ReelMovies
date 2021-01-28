import mongoose, { Schema, model } from 'mongoose';
import 'mongoose-type-email';

import { ObjectReference } from '../lib/db';

const UserSchema = new Schema({
  name: {
    first: String,
    last: String,
  },
  role: {
    type: String,
    enum: ['regular', 'contributing'],
    default: 'regular',
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  likes: [ObjectReference('Movie', false)],
  dislikes: [ObjectReference('Movie', false)],
  follower: [ObjectReference('Profiles', false)],
  followingUser: [ObjectReference('Profiles', false)],
  followingCrew: [ObjectReference('Person', false)],
});

export default model('Profiles', UserSchema);
