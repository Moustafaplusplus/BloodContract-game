import { Star } from 'lucide-react';
import './vipSparkle.css';

export default function VipName({ children, isVIP }) {
  if (!isVIP) return <>{children}</>;
  return (
    <span className="vip-sparkle-text relative inline-flex items-center gap-1">
      {children}
      <span className="vip-sparkle-anim" aria-hidden="true"></span>
      <span className="ml-1 text-yellow-400 flex items-center gap-1">
        <Star className="inline w-4 h-4" /> VIP
      </span>
    </span>
  );
} 