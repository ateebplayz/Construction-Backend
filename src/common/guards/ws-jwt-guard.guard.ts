import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers['authorization']?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException('Missing token');

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // attach user to socket data
      client.data.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
