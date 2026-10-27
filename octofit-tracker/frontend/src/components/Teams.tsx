import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      dataKey="teams"
      emptyLabel="teams"
      renderItem={(team) => (
        <>
          <strong>{String(team.name ?? 'Team')}</strong>
          <div>{Array.isArray(team.members) ? team.members.length : 0} member(s)</div>
        </>
      )}
    />
  );
}
