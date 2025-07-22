import { MinistryMissionService } from '../services/MinistryMissionService.js';
import { Character } from '../models/index.js';

export class MinistryMissionController {
  // Get all missions list with user progress
  static async getMissionsList(req, res) {
    try {
      const userId = req.user.id;
      
      // Get character level
      const character = await Character.findOne({
        where: { userId }
      });

      if (!character) {
        return res.status(404).json({
          success: false,
          message: 'Character not found'
        });
      }

      const missions = await MinistryMissionService.getMissionsList(userId, character.level);

      res.json({
        success: true,
        data: missions
      });
    } catch (error) {
      console.error('Error in getMissionsList:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get specific mission data
  static async getMissionData(req, res) {
    try {
      const userId = req.user.id;
      const { missionId } = req.params;

      const missionData = await MinistryMissionService.getMissionData(missionId, userId);

      res.json({
        success: true,
        data: missionData
      });
    } catch (error) {
      console.error('Error in getMissionData:', error);
      
      if (error.message === 'Mission not found') {
        return res.status(404).json({
          success: false,
          message: 'Mission not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Complete a mission
  static async completeMission(req, res) {
    try {
      const userId = req.user.id;
      const { missionId, ending } = req.body;

      if (!missionId || !ending) {
        return res.status(400).json({
          success: false,
          message: 'Mission ID and ending are required'
        });
      }

      const result = await MinistryMissionService.completeMission(userId, missionId, ending);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in completeMission:', error);
      
      if (error.message === 'Mission not found') {
        return res.status(404).json({
          success: false,
          message: 'Mission not found'
        });
      }

      if (error.message === 'Mission already completed') {
        return res.status(400).json({
          success: false,
          message: 'Mission already completed'
        });
      }

      if (error.message === 'Level requirement not met') {
        return res.status(400).json({
          success: false,
          message: 'Level requirement not met'
        });
      }

      if (error.message === 'Invalid ending') {
        return res.status(400).json({
          success: false,
          message: 'Invalid ending'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user mission statistics
  static async getUserMissionStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await MinistryMissionService.getUserMissionStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getUserMissionStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
} 