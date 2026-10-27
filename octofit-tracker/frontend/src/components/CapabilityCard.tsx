import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props = {
  title: string;
  description: string;
  endpoint: string;
  dataKey: string;
  emptyLabel: string;
  renderItem: (item: Record<string, unknown>, index: number) => React.ReactNode;
};

export function CapabilityCard({ title, description, endpoint, dataKey, emptyLabel, renderItem }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const payload = await getJson<Record<string, unknown>>(endpoint);
        const nextItems = Array.isArray(payload[dataKey]) ? (payload[dataKey] as Record<string, unknown>[]) : [];

        if (active) setItems(nextItems);
      } catch (caughtError) {
        if (!active) return;
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load data');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [dataKey, endpoint]);

  if (loading) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p role="status">Loading {title.toLowerCase()}...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <div role="alert">Unable to load {title.toLowerCase()}: {error}</div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p>No {emptyLabel}.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        <div className="d-grid gap-2">
          {items.map((item, index) => (
            <div key={index} className="border rounded p-3">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
