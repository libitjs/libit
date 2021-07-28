import {expect, sinon} from '@loopback/testlab';
import BluebirdPromise from 'bluebird';
import * as fs from 'fs';
import delay from 'delay';
import path from 'path';
import {IntervalTimer, IntervalTimerMode} from '../../interval';
import {fixturePath} from '../support';

describe('IntervalTimer', function() {
  testWithMode('dynamic');
  testWithMode('fixed');
  testWithMode('legacy');

  function testWithMode(mode: IntervalTimerMode) {
    describe(`mode - ${mode}`, function() {
      const OriginalPromise = Promise;
      let clock: sinon.SinonFakeTimers;

      beforeEach(async () => {
        // lolex fake clock
        clock = sinon.useFakeTimers();
        // eslint-disable-next-line no-global-assign
        Promise = BluebirdPromise as any;
        BluebirdPromise.setScheduler(fn => fn());
      });

      afterEach(async () => {
        clock.restore();
        // eslint-disable-next-line no-global-assign
        Promise = OriginalPromise;
      });

      it('should start and stop successfully with a synchronous handler', async () => {
        const timer = new IntervalTimer(mode);
        timer.start(() => {
        }, 1000);
        await timer.stop();
      });

      it('should start and stop successfully with an asynchronous handler', async () => {
        const timer = new IntervalTimer(mode);
        timer.start(async () => {
        }, 1000);
        await timer.stop();
      });

      it('should continue running even if an error occurs during execution', async () => {
        let actualCount = 0;
        const timer = new IntervalTimer(mode).start(async () => {
          actualCount = actualCount + 1;
          throw new Error('Some error.');
        }, 1000);

        clock.runToLast();
        clock.runToLast();

        await timer.stop();
        expect(actualCount).equal(2);
      });

      describe('fixtures', () => {
        runFixturesFromResource(mode, path.join(mode, 'execution-time-lt-interval.json'), () => clock);
        runFixturesFromResource(mode, path.join(mode, 'execution-time-gt-interval.json'), () => clock);
      });
    });
  }
});

function runFixturesFromResource(
  mode: IntervalTimerMode,
  resourceFilePath: string,
  clock: () => sinon.SinonFakeTimers,
) {
  const {t: title, f: fixtures} = loadResource(resourceFilePath);
  for (const [index, fixture] of fixtures.entries()) {
    it(`${title} [${index + 1}]`, async () => {
      await runFixture(mode, fixture, clock());
    });
  }
}

async function runFixture(mode: IntervalTimerMode, fixture: any, clock: sinon.SinonFakeTimers) {
  const {i: interval, x: executionTimes, d: duration, c: expectedCalls} = fixture;
  let callCount = 0;
  const actualCalls: any[] = [];
  const timer = IntervalTimer.start(
    mode,
    async () => {
      const startTime = new Date().getTime();
      callCount = callCount + 1;
      const executionTime = executionTimes[(callCount - 1) % executionTimes.length];
      await delay(executionTime);
      const endTime = new Date().getTime();
      actualCalls.push({s: startTime, e: endTime});
    },
    interval,
  );
  setTimeout(() => {
    // eslint-disable-next-line no-void
    void timer.stop();
  }, duration);
  clock.runAll();
  try {
    expect(actualCalls).deepEqual(expectedCalls);
  } catch (err) {
    console.log(JSON.stringify(actualCalls, null, 2));
    throw err;
  }
}

function loadResource(resourceFilePath: string): {t: string; f: any[]} {
  return JSON.parse(fs.readFileSync(fixturePath('interval-timer', resourceFilePath)).toString());
}
