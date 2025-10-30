import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { auth } from '@/modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const bearer = request.headers.authorization;
    try {
      const sessionData = await auth.api.getSession({
        headers: new Headers({ authorization: bearer }),
      });
      if (!sessionData || !sessionData.session || !sessionData.user) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      (request as any).user = sessionData.user;
      (request as any).session = sessionData.session;

      return true;
    } catch (e) {
      throw new UnauthorizedException('Session expired or invalid');
    }
  }
}
