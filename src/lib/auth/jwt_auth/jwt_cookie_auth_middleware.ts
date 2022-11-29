import { Request, Response, NextFunction } from "express"
import { LoggedInUser } from "..";
import { verifyJWT } from "./jwt_handler";

export const jwtCookieAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies) {
        return res.status(401).json({ message: "unauthorized" })
    }

    let loggedInUser = verifyJWT(req.cookies) as LoggedInUser;
    
    if (!loggedInUser) {
        return res.status(401).json({ message: "unauthorized" })
    }

    res.locals.loggedInUser = loggedInUser;

    next();
}