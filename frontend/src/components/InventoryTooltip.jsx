import React from 'react';
import { Package, Sword, Shield, Home, Car, Dog, Zap, Star } from 'lucide-react';

const rarityColors = {
  common: "text-zinc-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legend: "text-yellow-400",
};

const rarityIcons = {
  common: "⭐",
  uncommon: "⭐⭐",
  rare: "⭐⭐⭐",
  epic: "⭐⭐⭐⭐",
  legend: "⭐⭐⭐⭐⭐",
};

const itemTypeIcons = {
  weapon: Sword,
  armor: Shield,
  house: Home,
  car: Car,
  dog: Dog,
  special: Zap,
};

const itemTypeLabels = {
  weapon: "سلاح",
  armor: "درع",
  house: "منزل",
  car: "سيارة",
  dog: "كلب",
  special: "عنصر خاص",
};

export default function InventoryTooltip({ inventory, isVisible, position = { x: 0, y: 0 } }) {
  if (!isVisible || !inventory) return null;

  // Ensure inventory is an array
  const inventoryArray = Array.isArray(inventory.inventory) ? inventory.inventory : [];
  
  const groupedItems = inventoryArray.reduce((acc, item) => {
    const key = `${item.type}-${item.rarity}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div 
      className="fixed z-50 bg-gradient-to-br from-hitman-900 to-hitman-950 border border-hitman-700 rounded-lg shadow-2xl p-4 max-w-md max-h-96 overflow-y-auto"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-hitman-700">
        <Package className="w-5 h-5 text-accent-red" />
        <h3 className="text-white font-bold text-sm">
          مخزون {inventory.username || 'المستخدم'}
        </h3>
        <div className="ml-auto text-xs text-hitman-400">
          {inventory.totalItems || 0} عنصر
        </div>
      </div>

      {/* Inventory Items */}
      <div className="space-y-2">
        {Object.entries(groupedItems).map(([key, items]) => {
          const firstItem = items[0];
          const Icon = itemTypeIcons[firstItem.type] || Package;
          const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
          const equippedCount = items.filter(item => item.isEquipped).length;

          return (
            <div key={key} className="bg-hitman-800/50 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${rarityColors[firstItem.rarity]}`} />
                <span className={`text-sm font-medium ${rarityColors[firstItem.rarity]}`}>
                  {firstItem.name}
                </span>
                <span className="text-xs text-hitman-400">
                  {rarityIcons[firstItem.rarity]}
                </span>
                <span className="text-xs text-hitman-500">
                  {itemTypeLabels[firstItem.type]}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-hitman-400">
                    الكمية: {totalQuantity}
                  </span>
                  {equippedCount > 0 && (
                    <span className="text-accent-green">
                      مجهز: {equippedCount}
                    </span>
                  )}
                </div>
                
                {/* Item stats */}
                <div className="flex items-center gap-1">
                  {firstItem.damage && (
                    <span className="text-red-400 text-xs">
                      {firstItem.damage} ضرر
                    </span>
                  )}
                  {firstItem.def && (
                    <span className="text-blue-400 text-xs">
                      {firstItem.def} دفاع
                    </span>
                  )}
                  {firstItem.hpBonus && (
                    <span className="text-green-400 text-xs">
                      +{firstItem.hpBonus} صحة
                    </span>
                  )}
                  {firstItem.energyBonus && (
                    <span className="text-yellow-400 text-xs">
                      +{firstItem.energyBonus} طاقة
                    </span>
                  )}
                  {firstItem.powerBonus && (
                    <span className="text-purple-400 text-xs">
                      +{firstItem.powerBonus} قوة
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-2 border-t border-hitman-700 text-xs text-hitman-400">
        <div className="flex justify-between">
          <span>إجمالي العناصر: {inventory.totalItems || 0}</span>
          <span>العناصر المجهزة: {inventory.equippedItems || 0}</span>
        </div>
      </div>
    </div>
  );
} 