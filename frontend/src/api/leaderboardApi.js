
import api from './axios';

export const fetchLeaderboard = (metric) =>
  api.get(`/leaderboard/${metric}`).then(res => res.data);
