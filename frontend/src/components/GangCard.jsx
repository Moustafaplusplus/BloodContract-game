// ─────────────────────────  FRONTEND  ────────────────────────
// File: frontend/src/components/GangCard.jsx
//--------------------------------------------------------------
export default function GangCard({ gang, onClick }) {
  return (
    <div className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700" onClick={onClick}>
      <h3 className="font-bold text-lg">{gang.name}</h3>
      <p className="text-sm text-gray-400 line-clamp-2">{gang.description}</p>
      <p className="text-xs mt-1">👥 {gang.members.length} أعضاء</p>
    </div>
  );
}