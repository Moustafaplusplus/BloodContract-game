// frontend/src/api/fightApi.js

import axios from './axios';

/**
 * Initiate an attack on another user by their ID.
 */
export const attack = (targetId) =>
  axios.post(`/fight/${targetId}`);
