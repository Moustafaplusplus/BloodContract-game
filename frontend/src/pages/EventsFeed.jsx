import { useEffect, useState } from 'react';

export default function EventsFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // helper to grab events (optionally only those after a timestamp)
  const fetchEvents = (after) => {
    const url =
      `${import.meta.env.VITE_API_URL}/api/events` +
      (after ? `?after=${after}` : '');

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setEvents((prev) =>
          after ? [...data, ...prev] : data /* prepend new ones */
        );
        setLoading(false);
      })
      .catch(() => {
        setError('فشل تحميل الأحداث');
        setLoading(false);
      });
  };

  // initial load + 30-second polling
  useEffect(() => {
    fetchEvents();
    const id = setInterval(() => {
      const newest = events[0];
      const afterTs = newest ? new Date(newest.createdAt).getTime() : null;
      fetchEvents(afterTs);
    }, 30_000);
    return () => clearInterval(id);
  }, [events]);

  const icon = (t) =>
    ({ crime: '🧨', fight: '⚔️', buy: '💰', heal: '🩹' }[t] || '❔');

  if (loading) return <p className="p-6 text-gray-400">تحميل الأحداث…</p>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-4">
      <h1 className="text-3xl font-bold text-yellow-400">آخر الأحداث</h1>

      {error && <p className="text-red-400">{error}</p>}

      <ul className="space-y-2">
        {events.map((e) => (
          <li
            key={e._id}
            className="bg-gray-800 p-3 rounded flex items-start gap-2"
          >
            <span className="text-xl">{icon(e.type)}</span>
            <div>
              <span className="text-sm text-gray-400">
                [
                {new Date(e.createdAt).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                ]
              </span>{' '}
              {e.text}
            </div>
          </li>
        ))}

        {events.length === 0 && !error && (
          <li className="text-gray-400">لا توجد أحداث بعد.</li>
        )}
      </ul>
    </div>
  );
}