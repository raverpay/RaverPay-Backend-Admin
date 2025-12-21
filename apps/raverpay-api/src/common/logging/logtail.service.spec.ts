import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LogtailService } from './logtail.service';
import { Logtail } from '@logtail/node';

describe('LogtailService', () => {
  let service: LogtailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogtailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'LOGTAIL_SOURCE_TOKEN') return 'test-token';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LogtailService>(LogtailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('info', () => {
    it('should log info message when enabled', async () => {
      const mockLogtail = {
        info: jest.fn().mockResolvedValue(undefined),
      } as unknown as Logtail;

      // @ts-expect-error - accessing private property for testing
      service['logtail'] = mockLogtail;
      // @ts-expect-error - accessing private property for testing
      service['enabled'] = true;

      await service.info('Test message', { context: 'Test' });

      expect(mockLogtail.info).toHaveBeenCalledWith('Test message', {
        context: 'Test',
      });
    });

    it('should not log when disabled', async () => {
      const mockLogtail = {
        info: jest.fn(),
      } as unknown as Logtail;

      // @ts-expect-error - accessing private property for testing
      service['logtail'] = mockLogtail;
      // @ts-expect-error - accessing private property for testing
      service['enabled'] = false;

      await service.info('Test message');

      expect(mockLogtail.info).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error message when enabled', async () => {
      const mockLogtail = {
        error: jest.fn().mockResolvedValue(undefined),
      } as unknown as Logtail;

      // @ts-expect-error - accessing private property for testing
      service['logtail'] = mockLogtail;
      // @ts-expect-error - accessing private property for testing
      service['enabled'] = true;

      await service.error('Error message', { context: 'Test' });

      expect(mockLogtail.error).toHaveBeenCalledWith('Error message', {
        context: 'Test',
      });
    });
  });
});

