import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: String,
  focus: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    enum: ['endurance', 'strength', 'mobility', 'recovery'],
  },
  minutes: { type: Number, required: true, min: 1 },
  difficulty: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    enum: ['easy', 'moderate', 'hard'],
  },
});

export const Workout = model('Workout', workoutSchema);
