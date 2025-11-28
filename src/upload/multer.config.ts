import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads', // local folder
    filename: (req, file, cb) => {
      const uniqueSuffix = uuid();
      const extension = extname(file.originalname);
      cb(null, `${uniqueSuffix}${extension}`);
    },
  }),
};

export const imageFileFilter = (req: any, file: any, cb: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
