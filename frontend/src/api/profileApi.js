import axios from './axios';

export const getProfile  = (id) => axios.get(`/profile/${id || ''}`);
export const updateBio   = (bio) => axios.put('/profile', { bio });
export const uploadAvatar = (file) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return axios.put('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
