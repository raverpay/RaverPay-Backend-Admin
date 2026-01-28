import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

/**
 * Upload Controller
 *
 * Handles file uploads for documents, images, etc.
 * All endpoints require authentication
 */
@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload a document (PDF, DOC, etc.)
   */
  @Post('document')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a document',
    description:
      'Uploads a document file (PDF, DOC, DOCX, etc.). Maximum file size: 10MB.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            fileId: { type: 'string', example: 'uuid-v4-string' },
            fileName: { type: 'string', example: 'bank_statement.pdf' },
            fileSize: { type: 'number', example: 1024000 },
            mimeType: { type: 'string', example: 'application/pdf' },
            url: { type: 'string', example: 'https://storage.example.com/...' },
            uploadedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-28T12:00:00Z',
            },
          },
        },
        message: { type: 'string', example: 'Document uploaded successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file type not allowed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Validate file type
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.',
        );
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException(
          'File size exceeds maximum allowed size of 10MB',
        );
      }

      const result = await this.uploadService.uploadDocument(file);

      this.logger.log(`Document uploaded successfully: ${result.fileId}`);

      return {
        success: true,
        data: result,
        message: 'Document uploaded successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error uploading document: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Upload an image
   */
  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload an image',
    description:
      'Uploads an image file (JPEG, PNG, etc.). Maximum file size: 5MB.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file type not allowed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPG, JPEG, and PNG files are allowed.',
        );
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new BadRequestException(
          'File size exceeds maximum allowed size of 5MB',
        );
      }

      const result = await this.uploadService.uploadImage(file);

      this.logger.log(`Image uploaded successfully: ${result.fileId}`);

      return {
        success: true,
        data: result,
        message: 'Image uploaded successfully',
      };
    } catch (error) {
      this.logger.error(`Error uploading image: ${error.message}`, error.stack);
      throw error;
    }
  }
}
