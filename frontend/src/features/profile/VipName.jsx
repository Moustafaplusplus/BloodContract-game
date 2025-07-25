import { Star } from 'lucide-react';
import './vipSparkle.css';

export default function VipName({ children, isVIP, className = '' }) {
  if (!isVIP) return <span className={className}>{children}</span>;
  
  return (
    <span className={`vip-sparkle-text relative inline-flex items-center gap-1 ${className}`}>
      <span className="vip-name-text">{children}</span>
      <span className="vip-sparkle-anim" aria-hidden="true"></span>
      <span className="vip-badge flex items-center gap-1 text-yellow-400 font-bold text-xs">
        <Star className="inline w-3 h-3" />
        <span>VIP</span>
      </span>
    </span>
  );
} 