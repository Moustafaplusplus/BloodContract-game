import { BankAccount, BankTxn } from '../models/Bank.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { TaskService } from './TaskService.js';
import { NotificationService } from './NotificationService.js';
import { emitNotification } from '../socket.js';

export class BankService {
  // Get or create account
  static async getAccount(userId, t = null) {
    return (await BankAccount.findOrCreate({
      where: { userId },
      defaults: { balance: 0 },
      transaction: t,
    }))[0];
  }

  // Validate amount
  static validateAmount(n) {
    return Number.isFinite(n) && n > 0;
  }

  // Get account balance and cash
  static async getAccountInfo(userId) {
    const acc = await this.getAccount(userId);
    const chr = await Character.findOne({ where: { userId } });
    return { balance: acc.balance, money: chr?.money ?? 0 };
  }

  // Get transaction history
  static async getTransactionHistory(userId, limit = 30) {
    return await BankTxn.findAll({
      where: { userId, type: 'interest' },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  // Deposit cash to bank
  static async deposit(userId, amount) {
    if (!this.validateAmount(amount)) {
      throw new Error('invalid amount');
    }

    const t = await sequelize.transaction();
    try {
      const [acc, chr] = await Promise.all([
        this.getAccount(userId, t),
        Character.findOne({
          where: { userId },
          transaction: t,
          lock: t.LOCK.UPDATE,
        }),
      ]);

      if (!chr || chr.money < amount) {
        await t.rollback();
        throw new Error('insufficient cash');
      }

      chr.money -= amount;
      acc.balance += amount;

      await Promise.all([
        chr.save({ transaction: t }),
        acc.save({ transaction: t }),
      ]);
      await t.commit();

      await TaskService.updateProgress(userId, 'money_deposited', amount);
      await TaskService.updateProgress(userId, 'bank_balance', acc.balance);

      return { balance: acc.balance, money: chr.money };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // Withdraw cash from bank
  static async withdraw(userId, amount) {
    if (!this.validateAmount(amount)) {
      throw new Error('invalid amount');
    }

    const t = await sequelize.transaction();
    try {
      const [acc, chr] = await Promise.all([
        this.getAccount(userId, t),
        Character.findOne({
          where: { userId },
          transaction: t,
          lock: t.LOCK.UPDATE,
        }),
      ]);

      if (acc.balance < amount) {
        await t.rollback();
        throw new Error('insufficient balance');
      }

      acc.balance -= amount;
      chr.money += amount;

      await Promise.all([
        chr.save({ transaction: t }),
        acc.save({ transaction: t }),
      ]);
      await t.commit();

      await TaskService.updateProgress(userId, 'money_withdrawn', amount);
      await TaskService.updateProgress(userId, 'bank_balance', acc.balance);

      return { balance: acc.balance, money: chr.money };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // Apply daily interest
  static async applyDailyInterest() {
    const INTEREST_RATE = parseFloat(process.env.BANK_INTEREST_RATE ?? '0.05'); // 5%
    
    const t = await sequelize.transaction();
    try {
      const accounts = await BankAccount.findAll({
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      const now = Date.now();

      for (const acc of accounts) {
        const diffDays = (now - new Date(acc.lastInterestAt).getTime()) / 86_400_000; // ms → days

        if (diffDays >= 1) {
          // Get character to check VIP status
          const character = await Character.findOne({ 
            where: { userId: acc.userId },
            transaction: t 
          });
          
          // Calculate interest rate - VIP users get double interest
          let effectiveInterestRate = INTEREST_RATE;
          if (character && character.vipExpiresAt && new Date(character.vipExpiresAt) > new Date()) {
            effectiveInterestRate = INTEREST_RATE * 2; // Double interest for VIP users
          }
          
          const interest = Math.floor(acc.balance * effectiveInterestRate);
          acc.balance += interest;
          acc.lastInterestAt = new Date();
          await acc.save({ transaction: t });

          // ledger entry
          await BankTxn.create(
            { userId: acc.userId, amount: interest, type: 'interest' },
            { transaction: t }
          );

          // Create notification for interest received
          if (interest > 0) {
            // Check if this was VIP bonus interest
            const isVipBonus = character && character.vipExpiresAt && new Date(character.vipExpiresAt) > new Date();
            const notification = await NotificationService.createBankInterestNotification(acc.userId, interest, isVipBonus);
            emitNotification(acc.userId, notification);
          }
        }
      }

      await t.commit();
              // Interest applied successfully
    } catch (err) {
      await t.rollback();
      console.error('❌  Interest job failed', err);
      throw err;
    }
  }
} 