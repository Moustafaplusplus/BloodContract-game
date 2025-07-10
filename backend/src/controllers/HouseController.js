import { HouseService } from '../services/HouseService.js';

export class HouseController {
  static async getAllHouses(req, res) {
    try {
      const houses = await HouseService.getAllHouses();
      res.json(houses);
    } catch (error) {
      console.error('Get houses error:', error);
      res.status(500).json({ error: 'Failed to get houses' });
    }
  }

  static async getUserHouse(req, res) {
    try {
      const userHouse = await HouseService.getUserHouse(req.user.id);
      if (!userHouse) {
        return res.status(404).json({ message: 'No house purchased yet' });
      }
      res.json(userHouse.House);
    } catch (error) {
      console.error('Get user house error:', error);
      res.status(500).json({ error: 'Failed to get user house' });
    }
  }

  static async buyHouse(req, res) {
    try {
      const { houseId } = req.body;
      if (!houseId) {
        return res.status(400).json({ message: 'houseId required' });
      }

      const house = await HouseService.buyHouse(req.user.id, houseId);
      res.json({ message: 'House purchased successfully', house });
    } catch (error) {
      console.error('Buy house error:', error);
      if (error.message === 'Character or house not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Not enough money') {
        return res.status(400).json({ message: error.message });
      }
      if (error.message === 'Already owns a house') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ error: 'Failed to buy house' });
    }
  }

  static async sellHouse(req, res) {
    try {
      const result = await HouseService.sellHouse(req.user.id);
      res.json({ message: 'House sold', refund: result.refund });
    } catch (error) {
      console.error('Sell house error:', error);
      if (error.message === 'No house to sell') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ error: 'Failed to sell house' });
    }
  }
} 