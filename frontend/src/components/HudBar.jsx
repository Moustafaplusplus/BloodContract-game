// frontend/src/components/HudBar.jsx
// ------------------------------------------------------------
// Mobile‑first, translucent top HUD bar displaying live stats
// Now includes an EXP progress bar that resets on level‑up.
// ------------------------------------------------------------

import React from "react";
import { useHud } from "../context/HudProvider";

import {
  BatteryCharging,
  Heart,
  Trophy,
  Sword, // Power / Attack
  Shield,
  DollarSign,
  Award, // ribbon icon for EXP progress
} from "lucide-react";

/* -----------------------------------------------------------
 * Internal helpers
 * ---------------------------------------------------------*/

function ProgressBar({ Icon, value = 0, max = 100, label, barClass }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} aria-hidden="true" />
      <div className="flex-1 bg-gray-700/70 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full ${barClass} transition-[width] duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px]" title={`${label}: ${value}/${max}`}>{pct}%</span>
    </div>
  );
}

function Stat({ Icon, value = 0, label }) {
  return (
    <div className="flex flex-col items-center text-[10px]">
      <Icon size={18} aria-label={label} />
      <span className="font-semibold mt-0.5">{value}</span>
    </div>
  );
}

/* -----------------------------------------------------------
 * Main HUD component
 * ---------------------------------------------------------*/

export default function HudBar() {
  const hud = useHud() || {};
  const {
    energy = 0,
    hp,
    health,
    level = 1,
    power = 0,
    defense = 0,
    money = 0,
    exp = 0,
    expToNext, // comes from backend /character/me
  } = hud;

  const hpVal      = hp ?? health ?? 0;
  const expMax     = expToNext ?? level * 100; // fallback formula

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-gray-900/90 backdrop-blur-lg text-white shadow-lg">
      <div className="mx-auto max-w-screen-sm p-3 flex flex-col gap-3 md:flex-row md:items-center">
        {/* Progress bars */}
        <div className="flex flex-col flex-1 gap-2 overflow-hidden">
          <ProgressBar
            Icon={BatteryCharging}
            value={energy}
            max={100}
            label="Energy"
            barClass="bg-amber-400"
          />
          <ProgressBar
            Icon={Heart}
            value={hpVal}
            max={100}
            label="HP"
            barClass="bg-red-500"
          />
          <ProgressBar
            Icon={Award}
            value={exp}
            max={expMax}
            label="EXP"
            barClass="bg-emerald-400"
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3 md:gap-5 md:pl-6">
          <Stat Icon={Trophy} value={level} label="Level" />
          <Stat Icon={Sword}  value={power}  label="Power" />
          <Stat Icon={Shield} value={defense} label="Defense" />
          <Stat Icon={DollarSign} value={money} label="Money" />
        </div>
      </div>
    </header>
  );
}
