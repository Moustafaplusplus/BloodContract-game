import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchThread, sendMessage } from '../api/messageApi';
import { io } from 'socket.io-client';

export default function Messenger() {
  const { playerId } = useParams();       // route: /messenger/:playerId
  const [thread, setThread] = useState([]);
  const [text, setText]     = useState('');
  const endRef              = useRef();

  /* ---- initial fetch + websocket ---- */
  useEffect(() => {
    if (!playerId) return;

    fetchThread(playerId).then(({ data }) =>
      setThread(Array.isArray(data) ? data : [])
    );

    const socket = io('/', { path: '/ws' });
    socket.emit('join', { with: playerId });
    socket.on('dm', (msg) => setThread((prev) => [...prev, msg]));
    return () => socket.disconnect();
  }, [playerId]);

  /* ---- scroll to bottom ---- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const send = () => {
    const content = text.trim();
    if (!content) return;
    sendMessage(playerId, content).then(({ data }) =>
      setThread((prev) => [...prev, data])
    );
    setText('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {thread.length === 0 && (
          <p className="text-center text-sm text-muted">
            No messages yet. Say hi!
          </p>
        )}
        {thread.map((m) => (
          <div
            key={m._id || Math.random()}
            className={`p-2 rounded max-w-xs text-sm ${
              m.isMine ? 'bg-blue-300 ml-auto' : 'bg-gray-300'
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="p-2 border-t flex gap-2 bg-base-200">
        <input
          className="input flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type…"
        />
        <button className="btn btn-primary" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
