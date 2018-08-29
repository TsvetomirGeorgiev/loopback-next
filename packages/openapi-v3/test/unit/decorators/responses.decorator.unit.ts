// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {responses, getControllerSpec, get, post} from '../../../';
import {expect} from '@loopback/testlab';
import {model, property} from '@loopback/repository';
import {requestBody} from '../../../src';

describe('responses metadata', () => {
  it('sets responses metadata', () => {
    class MyController {
      @responses({
        '200': {
          description: 'test',
          content: {'application/json': {schema: {type: 'string'}}},
        },
      })
      @get('/')
      greet() {
        return 'Hello world';
      }
    }

    const spec = getControllerSpec(MyController);

    expect(spec.paths['/'].get).to.have.property('responses');
    expect(spec.paths['/'].get.responses).to.eql({
      '200': {
        description: 'test',
        content: {'application/json': {schema: {type: 'string'}}},
      },
    });
  });

  it('infers model for responses schema', () => {
    @model()
    class User {
      @property()
      name: string;
    }

    class MyController {
      @responses({
        '200': {
          description: 'test',
          content: {'application/json': {schema: User}},
        },
      })
      @post('/user')
      createUser(@requestBody() user: User) {
        return user;
      }
    }

    const spec = getControllerSpec(MyController);

    expect(spec.paths['/user'].post).to.have.property('responses');
    expect(spec.paths['/user'].post.responses).to.eql({
      '200': {
        description: 'test',
        content: {
          'application/json': {schema: {$ref: '#/components/schemas/User'}},
        },
      },
    });
  });

  it('infers type of model array for responses schema', () => {
    @model()
    class User {
      @property()
      name: string;
    }

    class MyController {
      @responses({
        '200': {
          description: 'test',
          content: {'application/json': {schema: {type: 'array', items: User}}},
        },
      })
      @get('/users')
      createUser() {
        return [];
      }
    }

    const spec = getControllerSpec(MyController);

    expect(spec.paths['/users'].get).to.have.property('responses');
    expect(spec.paths['/users'].get.responses).to.eql({
      '200': {
        description: 'test',
        content: {
          'application/json': {
            schema: {type: 'array', items: {$ref: '#/components/schemas/User'}},
          },
        },
      },
    });
  });
});
