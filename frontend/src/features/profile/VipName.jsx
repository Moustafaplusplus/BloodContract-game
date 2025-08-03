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
          <span className={`vip-sparkle-text relative inline-flex items-center gap-2 ${className}`}>
            <span className="vip-name-text">{displayName}</span>
            <span className="vip-badge flex items-center gap-1 text-black font-bold text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-1 rounded-md border border-yellow-300/50 shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-shadow duration-300">
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
          <span className="font-medium text-blood-400">
            {vipContent}
          </span>
        ) : (
          <Link to={`/dashboard/profile/${user.username}`} className="font-medium hover:underline text-blood-400 hover:text-blood-300 transition-colors duration-200">
            {vipContent}
          </Link>
        )}
        {showUsername && user.displayName && user.username !== user.displayName && (
          <span className="ml-2 text-xs text-white/50">({user.username})</span>
        )}
      </div>
    );
  }
  
  // Handle direct props (backward compatibility)
  if (!isVIP) return <span className={className}>{children}</span>;
  
  return (
    <span className={`vip-sparkle-text relative inline-flex items-center gap-2 ${className}`}>
      <span className="vip-name-text">{children}</span>
      <span className="vip-badge flex items-center gap-1 text-black font-bold text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-1 rounded-md border border-yellow-300/50 shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-shadow duration-300">
        <Star className="inline w-3 h-3 text-black" />
        <span className="text-black font-bold">VIP</span>
      </span>
    </span>
  );
}
