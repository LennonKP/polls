import { sign, verify } from 'jsonwebtoken';
import { JwtProvider } from '@/application/ports/JwtProvider';

export class JsonWebTokenProvider implements JwtProvider {
  private secret = process.env.JWT_SECRET || 'default-secret-change-in-production';

  async sign(payload: object): Promise<string> {
    return sign(payload, this.secret, { expiresIn: '1d' });
  }

  async verify(token: string): Promise<object | null> {
    try {
      const payload = verify(token, this.secret);
      return payload as object;
    } catch (error) {
      return null;
    }
  }
}

