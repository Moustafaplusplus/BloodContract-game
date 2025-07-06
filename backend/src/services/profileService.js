// backend/src/services/profileService.js
import User from '../models/user.js';  // ✅ fixed: default import

export async function getProfile(req, res) {
  const userId = req.params.id || req.user.id;

  const user = await User.findByPk(userId, {
    attributes: ['id', 'username', 'bio', 'avatarUrl', 'money', 'level', 'hp'],
  });

  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }

  res.json(user);
}

export async function updateProfile(req, res) {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }

  if (req.body.bio !== undefined) {
    user.bio = req.body.bio;
  }

  if (req.file) {
    user.avatarUrl = `/avatars/${req.file.filename}`;
  }

  await user.save();
  res.json(user);
}
