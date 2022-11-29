import { randomUUID } from 'crypto';
import { LoggedInUser } from '..';
import jwt from 'jsonwebtoken';

export const createJWT = (info: object): string => jwt.sign(info, process.env.JWT_SIGNING_SECRET || 'local_signing_only', {
    expiresIn: '1 day',
    issuer: 'indexter',
    keyid: randomUUID()
});

export const verifyJWT = (token: {lit: string}): LoggedInUser | null => {
    try {
        return jwt.verify(token.lit, process.env.JWT_SIGNING_SECRET || 'local_signing_only') as LoggedInUser;
    } catch(e) {
        console.log(e)
        return null;
    }
}