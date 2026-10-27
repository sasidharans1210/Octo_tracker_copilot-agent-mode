import { isValidObjectId } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

function ensureObjectId(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || !isValidObjectId(value)) {
    throw badRequest(`${fieldName} must be a valid MongoDB ObjectId`);
  }
  return value;
}

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw badRequest('Activity payload is required');
  }

  const raw = input as Record<string, unknown>;
  const userId = ensureObjectId(raw.userId, 'userId');
  const teamId = ensureObjectId(raw.teamId, 'teamId');
  const type = typeof raw.type === 'string' ? raw.type.trim().toLowerCase() : '';
  const minutesRaw = Number(raw.minutes);

  if (!type) {
    throw badRequest('Activity type is required');
  }
  if (!Number.isFinite(minutesRaw) || minutesRaw <= 0) {
    throw badRequest('Activity minutes must be a positive number');
  }
  if (!(await User.exists({ _id: userId }))) {
    throw badRequest('User does not exist');
  }
  if (!(await Team.exists({ _id: teamId }))) {
    throw badRequest('Team does not exist');
  }

  const points = Math.max(1, Math.round(minutesRaw * (type === 'strength' ? 1.5 : type === 'cycle' ? 1.25 : type === 'walk' ? 0.8 : 1)));
  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes: minutesRaw,
    points,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().sort({ name: 1 }).lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw badRequest('Team payload is required');
  }

  const raw = input as Record<string, unknown>;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const mascot = typeof raw.mascot === 'string' ? raw.mascot.trim() : '';
  const members = Array.isArray(raw.members) ? raw.members : [];

  if (!name) {
    throw badRequest('Team name is required');
  }
  if (!mascot) {
    throw badRequest('Team mascot is required');
  }

  const normalizedMembers = members.map((member) => {
    if (typeof member !== 'string') {
      throw badRequest('Team members must be valid user identifiers');
    }
    return ensureObjectId(member, 'member');
  });

  const team = await Team.create({ name, mascot, members: normalizedMembers });
  return team.toObject();
}

export async function getLeaderboard() {
  const rows = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'teamInfo' } },
    { $unwind: '$teamInfo' },
    { $project: { _id: 0, teamName: '$teamInfo.name', totalPoints: 1 } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return rows.map((row, index) => ({
    teamName: row.teamName,
    totalPoints: row.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = typeof userEmail === 'string' ? userEmail.trim().toLowerCase() : '';
  if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
    throw badRequest('A valid user email is required');
  }

  const user = await User.findOne({ email: normalizedEmail }).lean();
  if (!user) {
    throw badRequest('User not found');
  }

  const recentActivity = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(1).lean();
  const focusPreference = (() => {
    const goal = typeof user.fitnessGoal === 'string' ? user.fitnessGoal.toLowerCase() : '';
    const recentType = typeof recentActivity[0]?.type === 'string' ? recentActivity[0].type.toLowerCase() : '';

    if (goal === 'strength') return 'strength';
    if (goal === 'endurance') return 'endurance';
    if (recentType === 'strength') return 'strength';
    if (recentType === 'run' || recentType === 'cycle' || recentType === 'walk') return 'endurance';
    if (goal === 'mobility') return 'mobility';
    return 'endurance';
  })();

  const preferredWorkouts = await Workout.find({ focus: focusPreference }).lean();
  const allWorkouts = await Workout.find().lean();
  const uniqueWorkouts = [
    ...preferredWorkouts,
    ...allWorkouts.filter((workout) => !preferredWorkouts.some((preferred) => preferred._id.toString() === workout._id.toString())),
  ];

  return uniqueWorkouts.map((workout) => {
    const typeHint = typeof recentActivity[0]?.type === 'string' ? recentActivity[0].type.toLowerCase() : 'activity';
    const reason = workout.focus === 'strength'
      ? `Based on your strength goal and recent ${typeHint} activity, this workout matches your pattern.`
      : `Based on your recent ${typeHint} activity and endurance goal, this workout fits your pattern.`;

    return {
      ...workout,
      reason,
    };
  });
}

export { User };
