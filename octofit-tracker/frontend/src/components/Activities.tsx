import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      endpoint="/api/activities"
      dataKey="activities"
      emptyLabel="activities"
      renderItem={(activity) => (
        <>
          <strong>{String(activity.type ?? 'Activity')}</strong>
          <div>{String(activity.minutes ?? 0)} minutes · {String(activity.points ?? 0)} points</div>
        </>
      )}
    />
  );
}
