import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint="/api/workouts/suggestions/mona@example.com"
      dataKey="suggestions"
      emptyLabel="workout suggestions"
      renderItem={(workout) => (
        <>
          <strong>{String(workout.title ?? 'Workout')}</strong>
          <div>{String(workout.reason ?? 'Recommended for you')}</div>
        </>
      )}
    />
  );
}
