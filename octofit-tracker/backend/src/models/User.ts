import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /\S+@\S+\.\S+/,
  },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  fitnessGoal: {
    type: String,
    required: true,
    trim: true,
    enum: ['endurance', 'strength', 'mobility', 'recovery', 'general'],
  },
});

export const User = model('User', userSchema);
