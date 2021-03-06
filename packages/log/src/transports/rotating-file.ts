import {FileTransport, FileTransportOptions} from './file';
import {Rotation} from '../types';

const DAYS_IN_WEEK = 7;

export interface RotatingFileTransportOptions extends FileTransportOptions {
  rotation: Rotation;
}

export class RotatingFileTransport extends FileTransport<RotatingFileTransportOptions> {
  protected lastTimestamp: string = this.formatTimestamp(Date.now());

  /**
   * Format a `Date` object into a format used within the log file name.
   */
  formatTimestamp(ms: number): string {
    const {rotation} = this.options;
    const date = new Date(ms);
    let timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (rotation === 'monthly') {
      return timestamp;
    }

    // Special case, calculate the week manually and return,
    // but do not append so other rotations inherit!
    if (rotation === 'weekly') {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
      const offsetDate = date.getDate() + firstDay - 1;

      timestamp += `.W${Math.floor(offsetDate / DAYS_IN_WEEK) + 1}`;

      return timestamp;
    }

    timestamp += String(date.getDate()).padStart(2, '0');

    if (rotation === 'daily') {
      return timestamp;
    }

    timestamp += `.${String(date.getHours()).padStart(2, '0')}`;

    return timestamp;
  }

  /**
   * @inheritdoc
   */
  protected checkIfNeedsRotation() {
    if (this.lastSize > this.options.maxSize || this.formatTimestamp(Date.now()) !== this.lastTimestamp) {
      this.closeStreamAndRotateFile();
    }
  }

  /**
   * @inheritdoc
   */
  protected getRotatedFileName(): string {
    const name = this.path.name(true);
    const ext = this.path.ext(true);

    return `${name}-${this.lastTimestamp}.${ext}`;
  }

  /**
   * @inheritdoc
   */
  protected rotateFile() {
    super.rotateFile();

    // Update timestamp to the new format
    this.lastTimestamp = this.formatTimestamp(Date.now());
  }
}
