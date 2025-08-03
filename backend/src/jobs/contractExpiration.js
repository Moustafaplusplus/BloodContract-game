import { BloodContract } from '../models/index.js';
import { User } from '../models/index.js';
import { Character } from '../models/Character.js';
import { NotificationService } from '../services/NotificationService.js';
import { emitNotification } from '../socket.js';
import { Op } from 'sequelize';

export function startContractExpirationJob() {
  // Starting contract expiration job
  
  const checkContractExpirations = async () => {
    try {
      const now = new Date();
      
      // Find all contracts that just expired (within the last minute)
      const expiredContracts = await BloodContract.findAll({
        where: {
          status: 'open',
          expiresAt: { 
            [Op.lte]: now,
            [Op.gt]: new Date(now.getTime() - 60000) // Within last minute
          }
        },
        include: [
          {
            model: User,
            as: 'target',
            attributes: ['id', 'username']
          }
        ]
      });

      if (expiredContracts.length > 0) {
        // Process expired contracts
        
        for (const contract of expiredContracts) {
          // Mark contract as expired
          await contract.update({ status: 'expired' });
          
          // Send notification to poster about contract expiration
          try {
            const targetCharacter = await Character.findOne({ where: { userId: contract.targetId } });
            const targetName = targetCharacter?.name || targetCharacter?.username || 'Unknown';
            const notification = await NotificationService.createContractExpiredNotification(contract.posterId);
            emitNotification(contract.posterId, notification);
          } catch (notificationError) {
            console.error('[Contract Expiration Job] Notification error:', notificationError);
          }
        }
      }
    } catch (error) {
      console.error('❌ Contract expiration job error:', error);
    }
  };

  // Check every 30 seconds
  setInterval(checkContractExpirations, 30000);
  
  // Wait a moment for database to be ready, then do initial check
  setTimeout(checkContractExpirations, 5000);
} 