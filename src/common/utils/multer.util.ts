import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';

export const multerOptions: MulterOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'), false);
    } else {
      cb(null, true);
    }
  },
};
