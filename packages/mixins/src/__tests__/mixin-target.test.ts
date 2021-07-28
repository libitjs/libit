import {expect} from '@loopback/testlab';
import {MixinTarget} from '../mixin-target';

class Application {
  start() {

  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function MixinGreeting<T extends MixinTarget<Application>>(superClass: T) {
  return class extends superClass {
    greet(name: string) {
      return `Hello ${name}`;
    }
  };
}

class GreetingApplication extends MixinGreeting(Application) {
  // override mixin-ed greet function
  greet(name: string) {
    return `${super.greet(name)}, Good Evening`;
  }
}

describe('MixinTarget', () => {
  it('should work', function() {
    const app = new GreetingApplication();
    expect(app.start).is.type('function');
    expect(app.greet('Joe')).equal('Hello Joe, Good Evening');
  });
});
