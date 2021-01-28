import { Schema, model } from 'mongoose';

import { ObjectReference } from '../lib/db';

const NotifsSchema = new Schema({
  to: ObjectReference('Profiles'),
  message: {
    type: String,
    required: true,
  },
  movie: ObjectReference('Movie'),
});

export default model('Notifications', NotifsSchema);
