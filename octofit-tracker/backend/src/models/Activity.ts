import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  type: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    enum: ['run', 'cycle', 'strength', 'walk', 'mobility', 'swim', 'hike'],
  },
  minutes: { type: Number, required: true, min: 1 },
  points: { type: Number, required: true, min: 1 },
  occurredAt: { type: Date, required: true },
});

export const Activity = model('Activity', activitySchema);
