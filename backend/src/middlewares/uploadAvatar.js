import multer from 'multer';
import path from 'path';
import fs from 'fs';

// store uploads in backend/public/avatars
const uploadDir = path.resolve('public/avatars');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}${ext}`);          // e.g. 17.png
  },
});
export default multer({ storage }).single('avatar');
