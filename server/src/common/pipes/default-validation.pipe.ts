import {
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

export class DefaultValidationPipe extends ValidationPipe {
  constructor(overwriteDefaultOptions: ValidationPipeOptions = {}) {
    super({
      transform: true,
      forbidUnknownValues: true,
      whitelist: true,
      validationError: { target: false },
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        return { errors };
      },
      ...overwriteDefaultOptions,
    });
  }
}
