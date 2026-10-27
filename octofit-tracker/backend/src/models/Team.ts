import { Schema, model } from 'mongoose';

const teamSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  mascot: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  members: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
});

export const Team = model('Team', teamSchema);
