import MagicLinkRepository from './repository';
import EmailMagicLinkLoginController from './email_magic_link_login_controller';

type MagicLink = {
  id?: string | null;
  email: string;
  created_at?: Date | null;
};

export {MagicLink, MagicLinkRepository, EmailMagicLinkLoginController};
