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
// Image filter
export const imageFileFilter = (req: any, file: any, cb: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    cb(new Error('Only image files are allowed!'), false);
  } else {
    cb(null, true);
  }
};

// PDF filter
export const pdfFileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Only PDF files are allowed!'), false);
  } else {
    cb(null, true);
  }
};

// Excel filter
export const excelFileFilter = (req: any, file: any, cb: any) => {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel',                                        // .xls
      'text/csv',                                                         // .csv
      'application/csv',
    ];
  
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(
        new Error('Only Excel files (.xlsx, .xls) or CSV (.csv) are allowed!'),
        false,
      );
    } else {
      cb(null, true);
    }
  };
  