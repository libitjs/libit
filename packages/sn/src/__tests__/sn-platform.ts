import {expect, sinon} from '@loopback/testlab';
import execa from 'execa';
import {COMMANDS, sn, snSync} from '../sn';
import {stubPlatform} from './support';
import {samples, SerialValue} from './fixtures/samples';

export const itWithPlatform = (platform: string) => {
  const [p] = platform.split(/[-_]/g);
  const sample = samples[platform];

  if (!sample) {
    throw new Error(`No samples for platform ${platform}`);
  }

  const pkeys = COMMANDS[p].keys;

  describe(platform, () => {
    let keys: string[];
    let stub: sinon.SinonStub | undefined;
    let restorePlatform: Function;

    beforeEach(() => {
      restorePlatform = stubPlatform(platform);
      keys = ((typeof pkeys === 'function' ? pkeys() : pkeys) ?? ['serial']).map(k => k.toLowerCase());
    });

    afterEach(() => {
      restorePlatform();
      stub?.restore();
      stub = undefined;
    });

    describe('async', function () {
      it('should retrieve serial number', async function () {
        stub = sinon.stub(execa, 'command');
        for (let i = 0; i < keys.length; i++) {
          stub.onCall(i).returns(<any>{stdout: sample[keys[i]]?.output});
        }
        const answer = await sn({hash: false});
        expect(answer).equal(lastValue(sample, keys)?.result);
      });

      it('should retrieve uuid', async function () {
        stub = sinon.stub(execa, 'command');
        const rkeys = keys.slice().reverse();
        for (let i = 0; i < rkeys.length; i++) {
          stub.onCall(i).returns(<any>{stdout: sample[rkeys[i]]?.output});
        }
        const answer = await sn({hash: false, uuid: true});
        expect(answer).equal(lastValue(sample, rkeys)?.result);
      });
    });

    describe('sync', function () {
      it('should retrieve serial number', function () {
        stub = sinon.stub(execa, 'commandSync');
        for (let i = 0; i < keys.length; i++) {
          stub.onCall(i).returns(<any>{stdout: sample[keys[i]]?.output});
        }
        const answer = snSync({hash: false});
        expect(answer).equal(lastValue(sample, keys)?.result);
      });

      it('should retrieve uuid', function () {
        stub = sinon.stub(execa, 'commandSync');
        const rkeys = keys.slice().reverse();
        for (let i = 0; i < rkeys.length; i++) {
          stub.onCall(i).returns(<any>{stdout: sample[rkeys[i]]?.output});
        }
        const answer = snSync({hash: false, uuid: true});
        expect(answer).equal(lastValue(sample, rkeys)?.result);
      });
    });
  });
};

function lastValue(sample: any, keys: string[]): SerialValue {
  for (const key of keys) {
    if (sample[key]) {
      return sample[key];
    }
  }

  return sample[keys[keys.length - 1]];
}
