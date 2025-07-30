import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import './vipSparkle.css';

export default function VipName({ children, isVIP, className = '', user, showUsername = false, disableLink = false }) {
  // Handle user object prop
  if (user) {
    const displayName = user.displayName || user.name || user.username;
    const isUserVIP = user.vipExpiresAt && new Date(user.vipExpiresAt) > new Date();
    
    const vipContent = (
      <>
        {isUserVIP ? (
          <span className={`vip-sparkle-text relative inline-flex items-center gap-1 ${className}`}>
            <span className="vip-name-text">{displayName}</span>
            <span className="vip-badge flex items-center gap-1 text-black font-bold text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-1 rounded border border-yellow-300 shadow-lg">
              <Star className="inline w-3 h-3 text-black" />
              <span className="text-black font-bold">VIP</span>
            </span>
          </span>
        ) : (
          <span className={className}>{displayName}</span>
        )}
      </>
    );

    return (
      <div className="flex flex-col">
        {disableLink ? (
          <span className="font-medium text-accent-red">
            {vipContent}
          </span>
        ) : (
          <Link to={`/dashboard/profile/${user.username}`} className="font-medium hover:underline text-accent-red">
            {vipContent}
          </Link>
        )}
        {showUsername && user.displayName && user.username !== user.displayName && (
          <span className="ml-2 text-xs text-red-300">({user.username})</span>
        )}
      </div>
    );
  }
  
  // Handle direct props (backward compatibility)
  if (!isVIP) return <span className={className}>{children}</span>;
  
  return (
    <span className={`vip-sparkle-text relative inline-flex items-center gap-1 ${className}`}>
      <span className="vip-name-text">{children}</span>
      <span className="vip-badge flex items-center gap-1 text-black font-bold text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-1 rounded border border-yellow-300 shadow-lg">
        <Star className="inline w-3 h-3 text-black" />
        <span className="text-black font-bold">VIP</span>
      </span>
    </span>
  );
} 