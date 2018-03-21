// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export * from '@loopback/metadata';

export {
  isPromiseLike,
  BoundValue,
  Constructor,
  ValueOrPromise,
  MapObject,
  resolveList,
  resolveMap,
  resolveUntil,
  resolveValueOrPromise,
  tryWithFinally,
  getDeepProperty,
} from './value-promise';

export {Binding, BindingScope, BindingType} from './binding';

export {Context} from './context';
export {ResolutionSession, ResolutionOptions} from './resolution-session';
export {
  inject,
  Setter,
  Getter,
  Injection,
  InjectionMetadata,
  ENVIRONMENT_KEY,
} from './inject';
export {Provider} from './provider';

export {instantiateClass, invokeMethod} from './resolver';
// internals for testing
export {describeInjectedArguments, describeInjectedProperties} from './inject';
