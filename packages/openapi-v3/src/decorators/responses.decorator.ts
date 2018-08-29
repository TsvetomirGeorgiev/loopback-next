// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ResponsesObject} from '@loopback/openapi-v3-types';
import {MethodDecoratorFactory} from '@loopback/context';
import {OAI3Keys} from '../keys';
import * as _ from 'lodash';
import {inspect} from 'util';

const debug = require('debug')('loopback:openapi3:metadata:responses');

/**
 * Describe the response body of a Controller method.
 *
 * A typical OpenAPI responses object contains HTTP Status Codes and their
 * `description`, and `content`:
 *
 * ```ts
 * responsesObject: {
 *   '200': {
 *     description: 'returns a customer instance',
 *     content: {
 *       'application/json': {...schemaSpec},
 *       'application/text': {...schemaSpec},
 *     }
 *   },
 *   '404': {
 *     description: 'customer instance not found',
 *       content: {
 *         'application/json': {...schemaSpec},
 *     }
 *   }
 * }
 * ```
 *
 * If the `content` object is not provided, this decorator sets it
 * as `application/json` by default.
 *
 * The simplest usage is:
 *
 * ```ts
 * class MyController {
 *   @post('/User')
 *   @responses({
 *     '200': {
 *       content: {
 *         'application/json': {schema: User}
 *       }
 *     }
 *   })
 *   async create(@requestBody() user: User): Promise<User> {}
 * }
 * ```
 *
 * or with properties other than `content`
 *
 * ```ts
 * class MyController {
 *   @post('/User')
 *   @responses({
 *     '200': {
 *       description: '',
 *       content: {
 *         'application/json': {schema: User}
 *       }
 *     }
 *   })
 *   async create(@requestBody({description: 'a user'}) user: User) {}
 * }
 * ```
 */
export function responses(responsesObject: ResponsesObject) {
  return function(
    target: Object,
    member: string,
    // tslint:disable-next-line:no-any
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    debug('@responses() on %s.%s', target.constructor.name, member);
    debug('  responsesObject: %s', inspect(responsesObject, {depth: null}));

    for (const code in responsesObject) {
      if (!responsesObject[code].description) {
        responsesObject[code].description = '';
      }

      if (_.isEmpty(responsesObject[code].content)) {
        responsesObject[code].content = {'application/json': {}};
      }
    }

    debug('  final spec: ', inspect(responsesObject, {depth: null}));
    MethodDecoratorFactory.createDecorator<ResponsesObject>(
      OAI3Keys.RESPONSES_KEY,
      responsesObject,
    )(target, member, descriptor);
  };
}
