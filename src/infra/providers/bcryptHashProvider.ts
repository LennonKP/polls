import { HashProvider } from '@/application/ports/HashProvider';
import { hash, compare } from 'bcrypt';

export default class BcryptHashProvider implements HashProvider {
    private readonly salt: number;

    constructor(salt?: number) {
        this.salt = salt ?? 8;
    }

    async hash(plain: string): Promise<string> {
        return hash(plain, this.salt);
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return compare(plain, hash);
    }
}
