import { useHud } from '../context/HudProvider';
import { BatteryCharging, Heart, Flashlight, Trophy } from 'lucide-react';

function Bar({ Icon, value }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <Icon size={14} />
      <div className="flex-1 h-2 bg-gray-700 rounded">
        <div
          className="h-2 bg-emerald-500 rounded transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs">{value}</span>
    </div>
  );
}

export default function HudBar() {
  const { energy, health, courage, will } = useHud();
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
      <Bar Icon={BatteryCharging} value={energy} />
      <Bar Icon={Heart}           value={health} />
      <Bar Icon={Flashlight}      value={courage} />
      <Bar Icon={Trophy}          value={will} />
    </div>
  );
}
