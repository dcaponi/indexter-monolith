import { Request, Response, NextFunction } from "express";
import { Emailer } from "../lib/emailer";
import { UserRepository } from "../users";
import { MagicLinkRepository } from ".";

import { createJWT } from "../lib/auth/jwt_auth/jwt_handler";
const url = require("url");

export default class EmailMagicLinkLoginController {
    userRepository: UserRepository;
    magicLinkRepository: MagicLinkRepository;
    emailer: Emailer;
    magicLinkUrl = process.env.MAGIC_LINK_URL || "http://localhost:3000/login"

    constructor(userRepository: UserRepository, magicLinkRepository: MagicLinkRepository, emailer: Emailer) {
        this.userRepository = userRepository;
        this.magicLinkRepository = magicLinkRepository;
        this.emailer = emailer;
    }

    sendMagicLink = async (req: Request, res: Response, next: NextFunction) => {
        let { email } = req.body

        try {
            let user = await this.userRepository.findOne(email);
            if (user) {
                await this.magicLinkRepository.deleteByEmail(email);
                let magicLink = await this.magicLinkRepository.create({email});

                if (magicLink) {
                    this.emailer.send({
                        from: process.env.BUSINESS_EMAIL || '',
                        to: user.email,
                        subject: 'Here is your magic link',
                        html: `<h1>Thank you for verifying you are you!</h1> 
                        <p<Click the link to continue to Indexter</p>
                        <div><a href=${this.magicLinkUrl + "?magic=" + magicLink.id}>Log In</a></div>
                        <p>We use magic link emails so theres no need to manage yet another password</p>`
                    })
                    res.status(200).json(user);
                } else {
                    res.status(500).json({ message: "unable to create link" })
                }
            } else {
                let user = await this.userRepository.create({ email });
                let magicLink = await this.magicLinkRepository.create({ email });

                this.emailer.send({
                    from: process.env.BUSINESS_EMAIL || '',
                    to: user.email,
                    subject: 'Thanks for signing up for Indexter',
                    html: `<h1>Welcome to Indexter!</h1>
                    <p>Indexter meets you where you are with all your team\'s data right at your fingertips</p>
                    <div><a href=${this.magicLinkUrl + "?magic=" + magicLink.id}>click here to finish sign up and log in</a></div>`
                })
                res.status(201).json({ user: email });
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: "unable to authenticate user" })
        }
    }

    validateMagicLink = async (req: Request, res: Response, next: NextFunction) => {
        let {magic} = url.parse(req.url, true).query
        let magicLink = await this.magicLinkRepository.findOne(magic);
        if (!magicLink){
            
            res.redirect(401, "http://localhost:8080")
            return
        }

        let user = await this.userRepository.findOne(magicLink.email)
        if(!user) {
            console.log("unable to find user associated to ", magicLink)
            res.status(500).json({message: "unexpected error"})
        }

        let refreshToken = createJWT({ email: user.email });

        await this.magicLinkRepository.delete(magic);

        res.cookie(process.env.LOGIN_TOKEN_KEY || 'lit', refreshToken, {maxAge: 86_400_000, httpOnly: true})
        res.redirect(301, "http://localhost:8080")
    }

}