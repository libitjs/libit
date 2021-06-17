import {sinon} from '@loopback/testlab';

export function stubPlatform(platform: string) {
  const [p, a] = platform.split(/[-_]+/g);
  const sp = sinon.stub(process, 'platform').value(p);
  const sa = sinon.stub(process, 'arch').value(a);
  return () => {
    sp.restore();
    sa.restore();
  };
}
