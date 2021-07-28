import {expect} from '@loopback/testlab';
import {
  DisposableStore,
  dispose,
  IDisposable,
  MultiDisposeError,
  ReferenceCollection,
  toDisposable,
} from '../lifecycle';

class Disposable implements IDisposable {
  isDisposed = false;

  dispose() {
    this.isDisposed = true;
  }
}

describe('Lifecycle', () => {
  it('dispose single disposable', () => {
    const disposable = new Disposable();

    expect(!disposable.isDisposed).ok();

    dispose(disposable);

    expect(disposable.isDisposed).ok();
  });

  it('dispose disposable array', () => {
    const disposable = new Disposable();
    const disposable2 = new Disposable();

    expect(!disposable.isDisposed).ok();
    expect(!disposable2.isDisposed).ok();

    dispose([disposable, disposable2]);

    expect(disposable.isDisposed).ok();
    expect(disposable2.isDisposed).ok();
  });

  it('dispose disposables', () => {
    const disposable = new Disposable();
    const disposable2 = new Disposable();

    expect(!disposable.isDisposed).ok();
    expect(!disposable2.isDisposed).ok();

    dispose(disposable);
    dispose(disposable2);

    expect(disposable.isDisposed).ok();
    expect(disposable2.isDisposed).ok();
  });

  it('dispose array should dispose all if a child throws on dispose', () => {
    const disposedValues = new Set<number>();

    let thrownError: any;
    try {
      dispose([
        toDisposable(() => {
          disposedValues.add(1);
        }),
        toDisposable(() => {
          throw new Error('I am error');
        }),
        toDisposable(() => {
          disposedValues.add(3);
        }),
      ]);
    } catch (e) {
      thrownError = e;
    }

    expect(disposedValues.has(1)).ok();
    expect(disposedValues.has(3)).ok();
    expect.strictEqual(thrownError.message, 'I am error');
  });

  it('dispose array should rethrow composite error if multiple entries throw on dispose', () => {
    const disposedValues = new Set<number>();

    let thrownError: any;
    try {
      dispose([
        toDisposable(() => {
          disposedValues.add(1);
        }),
        toDisposable(() => {
          throw new Error('I am error 1');
        }),
        toDisposable(() => {
          throw new Error('I am error 2');
        }),
        toDisposable(() => {
          disposedValues.add(4);
        }),
      ]);
    } catch (e) {
      thrownError = e;
    }

    expect(disposedValues.has(1)).ok();
    expect(disposedValues.has(4)).ok();
    expect(thrownError instanceof MultiDisposeError).ok();
    expect.strictEqual((thrownError as MultiDisposeError).errors.length, 2);
    expect.strictEqual((thrownError as MultiDisposeError).errors[0].message, 'I am error 1');
    expect.strictEqual((thrownError as MultiDisposeError).errors[1].message, 'I am error 2');
  });

  it('Action bar has broken accessibility #100273', function () {
    const array = [
      {
        dispose() {},
      },
      {
        dispose() {},
      },
    ];
    const array2 = dispose(array);

    expect(array.length).equal(2);
    expect(array2.length).equal(0);
    expect(array !== array2).ok();

    const set = new Set<IDisposable>([
      {
        dispose() {},
      },
      {
        dispose() {},
      },
    ]);
    const setValues = set.values();
    const setValues2 = dispose(setValues);
    expect(setValues === setValues2).ok();
  });
});

describe('DisposableStore', () => {
  it('dispose should call all child disposes even if a child throws on dispose', () => {
    const disposedValues = new Set<number>();

    const store = new DisposableStore();
    store.add(
      toDisposable(() => {
        disposedValues.add(1);
      }),
    );
    store.add(
      toDisposable(() => {
        throw new Error('I am error');
      }),
    );
    store.add(
      toDisposable(() => {
        disposedValues.add(3);
      }),
    );

    let thrownError: any;
    try {
      store.dispose();
    } catch (e) {
      thrownError = e;
    }

    expect(disposedValues.has(1)).ok();
    expect(disposedValues.has(3)).ok();
    expect.strictEqual(thrownError.message, 'I am error');
  });

  it('dispose should throw composite error if multiple children throw on dispose', () => {
    const disposedValues = new Set<number>();

    const store = new DisposableStore();
    store.add(
      toDisposable(() => {
        disposedValues.add(1);
      }),
    );
    store.add(
      toDisposable(() => {
        throw new Error('I am error 1');
      }),
    );
    store.add(
      toDisposable(() => {
        throw new Error('I am error 2');
      }),
    );
    store.add(
      toDisposable(() => {
        disposedValues.add(4);
      }),
    );

    let thrownError: any;
    try {
      store.dispose();
    } catch (e) {
      thrownError = e;
    }

    expect(disposedValues.has(1)).ok();
    expect(disposedValues.has(4)).ok();
    expect(thrownError instanceof MultiDisposeError).ok();
    expect.strictEqual((thrownError as MultiDisposeError).errors.length, 2);
    expect.strictEqual((thrownError as MultiDisposeError).errors[0].message, 'I am error 1');
    expect.strictEqual((thrownError as MultiDisposeError).errors[1].message, 'I am error 2');
  });
});

describe('Reference Collection', () => {
  class Collection extends ReferenceCollection<number> {
    private _count = 0;
    get count() {
      return this._count;
    }

    protected createReferencedObject(key: string): number {
      this._count++;
      return key.length;
    }

    protected destroyReferencedObject(key: string, object: number): void {
      this._count--;
    }
  }

  it('simple', () => {
    const collection = new Collection();

    const ref1 = collection.acquire('test');
    expect(ref1).ok();
    expect(ref1.object).equal(4);
    expect(collection.count).equal(1);
    ref1.dispose();
    expect(collection.count).equal(0);

    const ref2 = collection.acquire('test');
    const ref3 = collection.acquire('test');
    expect(ref2.object).equal(ref3.object);
    expect(collection.count).equal(1);

    const ref4 = collection.acquire('monkey');
    expect(ref4.object).equal(6);
    expect(collection.count).equal(2);

    ref2.dispose();
    expect(collection.count).equal(2);

    ref3.dispose();
    expect(collection.count).equal(1);

    ref4.dispose();
    expect(collection.count).equal(0);
  });
});
