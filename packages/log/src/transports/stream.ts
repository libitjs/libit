import {Transport} from '../transport';
import {TransportOptions, Writable} from '../types';

export interface StreamTransportOptions extends TransportOptions {
  stream: Writable;
}

export class StreamTransport extends Transport<StreamTransportOptions> {
  write(message: string) {
    this.options.stream.write(message);
  }
}
