import { CarService } from '../services/CarService.js';

export class CarController {
  // Get all available cars
  static async getAllCars(req, res) {
    try {
      const cars = await CarService.getAllCars();
      res.json(cars);
    } catch (error) {
      console.error('Get all cars error:', error);
      res.status(500).json({ error: 'Failed to get cars' });
    }
  }

  // Get user's cars
  static async getUserCars(req, res) {
    try {
      const cars = await CarService.getUserCars(req.user.id);
      res.json(cars);
    } catch (error) {
      console.error('Get user cars error:', error);
      res.status(500).json({ error: 'Failed to get user cars' });
    }
  }

  // Get user's active car
  static async getUserActiveCar(req, res) {
    try {
      const activeCar = await CarService.getUserActiveCar(req.user.id);
      if (!activeCar) {
        return res.status(404).json({ message: 'No active car' });
      }
      res.json(activeCar);
    } catch (error) {
      console.error('Get user active car error:', error);
      res.status(500).json({ error: 'Failed to get active car' });
    }
  }

  // Buy a car
  static async buyCar(req, res) {
    try {
      const { carId } = req.body;
      if (!carId) {
        return res.status(400).json({ error: 'Car ID required' });
      }

      const result = await CarService.buyCar(req.user.id, carId);
      res.status(201).json(result);
    } catch (error) {
      console.error('Buy car error:', error);
      if (error.message === 'Character or car not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Not enough money') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Already own this car') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to buy car' });
    }
  }

  // Activate a car
  static async activateCar(req, res) {
    try {
      const { carId } = req.params;
      const result = await CarService.activateCar(req.user.id, carId);
      res.json(result);
    } catch (error) {
      console.error('Activate car error:', error);
      if (error.message === 'Car not owned') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to activate car' });
    }
  }

  // Deactivate current car
  static async deactivateCar(req, res) {
    try {
      const result = await CarService.deactivateCar(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Deactivate car error:', error);
      if (error.message === 'No active car to deactivate') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to deactivate car' });
    }
  }

  // Sell a car
  static async sellCar(req, res) {
    try {
      const { carId } = req.params;
      const result = await CarService.sellCar(req.user.id, carId);
      res.json(result);
    } catch (error) {
      console.error('Sell car error:', error);
      if (error.message === 'Car not owned') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Cannot sell active car. Deactivate it first.') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to sell car' });
    }
  }
} 