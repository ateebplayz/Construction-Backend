import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';

export const multerOptions: MulterOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // bumped to 50MB for videos
  fileFilter: (req, file, cb) => {
    if (
      !file.mimetype.startsWith('image/') &&
      !file.mimetype.startsWith('video/')
    ) {
      cb(new Error('Only image and video files are allowed!'), false);
    } else {
      cb(null, true);
    }
  },
};
