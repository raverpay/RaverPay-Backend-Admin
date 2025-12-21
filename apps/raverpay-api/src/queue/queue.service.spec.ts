import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { Queue } from 'bullmq';

describe('QueueService', () => {
  let service: QueueService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'USE_BULLMQ_QUEUE') return 'true';
              if (key === 'REDIS_URL') return 'redis://localhost:6379';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addNotificationJob', () => {
    it('should add a notification job to the queue', async () => {
      const jobData = {
        userId: 'user-123',
        eventType: 'test_event',
        channels: ['EMAIL'],
        title: 'Test',
        message: 'Test message',
      };

      // Mock queue methods
      const mockQueue = {
        add: jest.fn().mockResolvedValue({ id: 'job-123' }),
      } as unknown as Queue;

      // @ts-expect-error - accessing private property for testing
      service['notificationQueue'] = mockQueue;

      await service.addNotificationJob(jobData);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'notification',
        jobData,
        expect.objectContaining({
          attempts: expect.any(Number),
          backoff: expect.any(Object),
        }),
      );
    });
  });
});

