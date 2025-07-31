import { ConfinementService } from '../services/ConfinementService.js';

/**
 * Middleware to check if user is in hospital and restrict access
 */
export async function checkHospitalAccess(req, res, next) {
  try {
    const hospitalStatus = await ConfinementService.getHospitalStatus(req.user.id);
    
    if (hospitalStatus.inHospital) {
      return res.status(403).json({
        error: 'Hospital Access Restricted',
        message: 'لا يمكن الوصول لهذه الميزة أثناء وجودك في المستشفى',
        remainingSeconds: hospitalStatus.remainingSeconds,
        cost: hospitalStatus.cost,
        type: 'hospital'
      });
    }
    
    next();
  } catch (error) {
    console.error('[Confinement Middleware] Hospital check error:', error);
    next(); // Continue if check fails
  }
}

/**
 * Middleware to check if user is in jail and restrict access
 */
export async function checkJailAccess(req, res, next) {
  try {
    const jailStatus = await ConfinementService.getJailStatus(req.user.id);
    
    if (jailStatus.inJail) {
      return res.status(403).json({
        error: 'Jail Access Restricted',
        message: 'لا يمكن الوصول لهذه الميزة أثناء وجودك في السجن',
        remainingSeconds: jailStatus.remainingSeconds,
        cost: jailStatus.cost,
        type: 'jail'
      });
    }
    
    next();
  } catch (error) {
    console.error('[Confinement Middleware] Jail check error:', error);
    next(); // Continue if check fails
  }
}

/**
 * Middleware to check if user is in any confinement (hospital or jail)
 */
export async function checkConfinementAccess(req, res, next) {
  try {
    const [hospitalStatus, jailStatus] = await Promise.all([
      ConfinementService.getHospitalStatus(req.user.id),
      ConfinementService.getJailStatus(req.user.id)
    ]);
    
    if (hospitalStatus.inHospital) {
      return res.status(403).json({
        error: 'Hospital Access Restricted',
        message: 'لا يمكن الوصول لهذه الميزة أثناء وجودك في المستشفى',
        remainingSeconds: hospitalStatus.remainingSeconds,
        cost: hospitalStatus.cost,
        type: 'hospital'
      });
    }
    
    if (jailStatus.inJail) {
      return res.status(403).json({
        error: 'Jail Access Restricted',
        message: 'لا يمكن الوصول لهذه الميزة أثناء وجودك في السجن',
        remainingSeconds: jailStatus.remainingSeconds,
        cost: jailStatus.cost,
        type: 'jail'
      });
    }
    
    next();
  } catch (error) {
    console.error('[Confinement Middleware] Confinement check error:', error);
    next(); // Continue if check fails
  }
}

/**
 * Middleware to add confinement status to request object
 */
export async function addConfinementStatus(req, res, next) {
  try {
    const [hospitalStatus, jailStatus] = await Promise.all([
      ConfinementService.getHospitalStatus(req.user.id),
      ConfinementService.getJailStatus(req.user.id)
    ]);
    
    req.confinementStatus = {
      inHospital: hospitalStatus.inHospital,
      inJail: jailStatus.inJail,
      hospital: hospitalStatus,
      jail: jailStatus
    };
    
    next();
  } catch (error) {
    console.error('[Confinement Middleware] Status check error:', error);
    req.confinementStatus = { inHospital: false, inJail: false };
    next();
  }
} 