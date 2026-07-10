import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AccessTokenPayload } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as AccessTokenPayload;
  },
);
