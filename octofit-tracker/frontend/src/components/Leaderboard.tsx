import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      dataKey="leaderboard"
      emptyLabel="leaderboard entries"
      renderItem={(entry) => (
        <>
          <strong>{String(entry.teamName ?? 'Team')}</strong>
          <div>{String(entry.totalPoints ?? 0)} total points · Rank {String(entry.rank ?? 0)}</div>
        </>
      )}
    />
  );
}
