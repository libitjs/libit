import {Ticket} from '@libit/josa';

export interface Digestible {
  digest: string;
}

export type DigestibleTicket = Ticket<Digestible>;

export function isDigestibleTicket(target: any): target is DigestibleTicket {
  return !!target && typeof target.digest === 'string';
}
