import {Ticket} from '@libit/josa';

export interface Digestible {
  digest: string;
}

export type DigestibleTicket = Ticket<Digestible>;
