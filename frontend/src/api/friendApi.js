import axios from './axios';

export const getFriends   = () => axios.get('/friends');
export const addFriend    = id => axios.post(`/friends/${id}`);
export const acceptFriend = id => axios.post(`/friends/${id}/accept`);
export const removeFriend = id => axios.delete(`/friends/${id}`);
