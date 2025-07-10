import { BankService } from '../services/BankService.js';

export class BankController {
  static async getAccountInfo(req, res) {
    try {
      const accountInfo = await BankService.getAccountInfo(req.user.id);
      res.json(accountInfo);
    } catch (error) {
      console.error('Bank account info error:', error);
      res.sendStatus(500);
    }
  }

  static async getTransactionHistory(req, res) {
    try {
      const history = await BankService.getTransactionHistory(req.user.id);
      res.json(history);
    } catch (error) {
      console.error('Bank history error:', error);
      res.sendStatus(500);
    }
  }

  static async deposit(req, res) {
    try {
      const amount = Number(req.body.amount);
      const result = await BankService.deposit(req.user.id, amount);
      res.json(result);
    } catch (error) {
      console.error('Bank deposit error:', error);
      if (error.message === 'invalid amount') {
        return res.status(400).send('invalid amount');
      }
      if (error.message === 'insufficient cash') {
        return res.status(400).send('insufficient cash');
      }
      res.sendStatus(500);
    }
  }

  static async withdraw(req, res) {
    try {
      const amount = Number(req.body.amount);
      const result = await BankService.withdraw(req.user.id, amount);
      res.json(result);
    } catch (error) {
      console.error('Bank withdraw error:', error);
      if (error.message === 'invalid amount') {
        return res.status(400).send('invalid amount');
      }
      if (error.message === 'insufficient balance') {
        return res.status(400).send('insufficient balance');
      }
      res.sendStatus(500);
    }
  }
} 