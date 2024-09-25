import { Injectable } from '@nestjs/common';
import { normalizePath } from 'src/utils/mormalPath';

@Injectable()
export class FileService {
  handleUploadedFile(file: Express.Multer.File) {
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: normalizePath(file.path),
      size: file.size,
    };
  }
}
