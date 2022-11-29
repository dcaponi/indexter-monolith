import express from "express";
import { PoolClient } from "pg";
import { Emailer } from "../lib/emailer";
import { UserRepository } from "../users";
import { MagicLinkRepository, EmailMagicLinkLoginController } from ".";

const emailMagicLinkLoginRoutes = (pc: PoolClient, emailer: Emailer) => {
    let router = express.Router();
    let userRepository = new UserRepository(pc);
    let magicLinkRepository = new MagicLinkRepository(pc);
    let controller = new EmailMagicLinkLoginController(userRepository, magicLinkRepository, emailer);

    router
        .post('/', controller.sendMagicLink)
        .get('/', controller.validateMagicLink)

    return router;
}

export default emailMagicLinkLoginRoutes