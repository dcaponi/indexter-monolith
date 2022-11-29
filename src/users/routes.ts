import express from 'express'
import { PoolClient } from 'pg';
import { UserRepository } from '.';
import UserController from './controller';
import { Emailer } from '../lib/emailer';
import { MagicLinkRepository } from '../auth';
import { jwtCookieAuth } from '../lib/auth/jwt_auth/jwt_cookie_auth_middleware';

const userRoutes = (pc: PoolClient, emailer: Emailer) => {
    let router = express.Router();

    let userRepository = new UserRepository(pc);
    let magicLinkRepository = new MagicLinkRepository(pc);
    let userController = new UserController(userRepository, magicLinkRepository, emailer);

    router.route('/')
        .get(jwtCookieAuth, userController.getUser)
        
    return router;
}

export default userRoutes;