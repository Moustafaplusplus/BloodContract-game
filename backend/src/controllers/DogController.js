import { DogService } from '../services/DogService.js';

export class DogController {
  static async getAllDogs(req, res) {
    try {
      const dogs = await DogService.getAllDogs();
      res.json(dogs);
    } catch (error) {
      console.error('Get all dogs error:', error);
      res.status(500).json({ error: 'Failed to get dogs' });
    }
  }

  static async getUserDogs(req, res) {
    try {
      const dogs = await DogService.getUserDogs(req.user.id);
      res.json(dogs);
    } catch (error) {
      console.error('Get user dogs error:', error);
      res.status(500).json({ error: 'Failed to get user dogs' });
    }
  }

  static async getUserActiveDog(req, res) {
    try {
      const activeDog = await DogService.getUserActiveDog(req.user.id);
      if (!activeDog) {
        return res.status(404).json({ message: 'No active dog' });
      }
      res.json(activeDog);
    } catch (error) {
      console.error('Get user active dog error:', error);
      res.status(500).json({ error: 'Failed to get active dog' });
    }
  }

  static async buyDog(req, res) {
    try {
      const { dogId } = req.body;
      if (!dogId) return res.status(400).json({ message: 'dogId required' });
      const dog = await DogService.buyDog(req.user.id, dogId);
      res.json({ message: 'Dog purchased successfully', dog });
    } catch (error) {
      console.error('Buy dog error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  static async activateDog(req, res) {
    try {
      const { dogId } = req.body;
      if (!dogId) return res.status(400).json({ message: 'dogId required' });
      const userDog = await DogService.activateDog(req.user.id, dogId);
      res.json({ message: 'Dog activated', userDog });
    } catch (error) {
      console.error('Activate dog error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  static async deactivateDog(req, res) {
    try {
      const result = await DogService.deactivateDog(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Deactivate dog error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  static async sellDog(req, res) {
    try {
      const { dogId } = req.body;
      if (!dogId) return res.status(400).json({ message: 'dogId required' });
      const result = await DogService.sellDog(req.user.id, dogId);
      res.json({ message: 'Dog sold', refund: result.refund, dogId });
    } catch (error) {
      console.error('Sell dog error:', error);
      res.status(400).json({ message: error.message });
    }
  }
} 