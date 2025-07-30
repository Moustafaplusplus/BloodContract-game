import React from 'react';

const BlackcoinIcon = () => {
  return (
    <>
      <img 
        src="/images/blackcoins-icon.png" 
        alt="Blackcoin"
        className="w-4 h-4 object-contain"
        onError={(e) => {
          // Fallback to CSS icon if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline-block';
        }}
      />
      <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-br from-black via-zinc-900 to-zinc-800 border-2 border-accent-red flex items-center justify-center mr-1 hidden">
        <span className="text-xs text-accent-red font-bold">ع</span>
      </span>
    </>
  );
};

export default BlackcoinIcon; 