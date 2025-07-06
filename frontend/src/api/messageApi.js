// ---------------------------------------------
// Simple helper for direct messages (DMs)
// ---------------------------------------------
import axios from './axios';

/** GET /api/messenger/:userId  – fetch thread history */
export const fetchThread = (userId) =>
  axios.get(`/messenger/${userId}`);

/** POST /api/messenger/:userId  – send one DM */
export const sendMessage = (userId, content) =>
  axios.post(`/messenger/${userId}`, { content });
