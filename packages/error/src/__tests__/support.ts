import {expect} from '@loopback/testlab';

type AnyConstructor = new (...args: any[]) => any;

export const checkProtoChain = (ctor: AnyConstructor, ...chain: AnyConstructor[]) => {
  const error = new ctor();
  expect(error).instanceOf(ctor);
  chain.forEach(type => expect(error).instanceOf(type));
};

type CheckedProperties = {
  [key: string]: any;
  name: string;
  message: string;
};
export const checkProperties = (error: any, properties: CheckedProperties) => {
  Object.keys(properties).forEach(property => expect(error[property]).equal(properties[property]));
  const stackPattern = properties.message
    ? new RegExp(`${properties.name}: ${properties.message}`)
    : new RegExp(`^${properties.name}\\b`);
  expect(error.stack).match(stackPattern);
};
