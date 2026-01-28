import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

/**
 * Upload Service
 *
 * Handles file upload operations using Cloudinary
 */
@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Upload a document file
   * @param file - The file to upload
   * @returns Upload result
   */
  async uploadDocument(file: Express.Multer.File) {
    try {
      // Upload to Cloudinary in the 'documents' folder
      const url = await this.cloudinaryService.uploadImage(file, 'documents');

      this.logger.log(`Document uploaded to Cloudinary: ${url}`);

      return {
        fileId: this.cloudinaryService.extractPublicId(url) || 'unknown',
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        url,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error uploading document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload an image file
   * @param file - The file to upload
   * @returns Upload result
   */
  async uploadImage(file: Express.Multer.File) {
    try {
      // Upload to Cloudinary in the 'images' folder
      const url = await this.cloudinaryService.uploadImage(file, 'images');

      this.logger.log(`Image uploaded to Cloudinary: ${url}`);

      return {
        fileId: this.cloudinaryService.extractPublicId(url) || 'unknown',
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        url,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error uploading image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a file from Cloudinary
   * @param publicId - The Cloudinary public ID
   */
  async deleteFile(publicId: string) {
    try {
      await this.cloudinaryService.deleteImage(publicId);

      this.logger.log(`File deleted from Cloudinary: ${publicId}`);

      return {
        fileId: publicId,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }
}
