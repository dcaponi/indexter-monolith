import { Email, NodeEmailer }from "./emailer";

interface Emailer {
    send(email: Email): void
}

export {
    Email,
    NodeEmailer,
    Emailer
}