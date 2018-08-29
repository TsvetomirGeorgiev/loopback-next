// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  param,
  patch,
  post,
  put,
  requestBody,
  responses,
} from '@loopback/rest';
import {Todo} from '../models';
import {TodoRepository} from '../repositories';
import {GeocoderService} from '../services';

export class TodoController {
  constructor(
    @repository(TodoRepository) protected todoRepo: TodoRepository,
    @inject('services.GeocoderService') protected geoService: GeocoderService,
  ) {}

  @responses({
    '200': {
      description: 'Todo model instance',
      content: {'application/json': {schema: Todo}},
    },
  })
  @post('/todos')
  async createTodo(@requestBody() todo: Todo): Promise<Todo> {
    if (todo.remindAtAddress) {
      // TODO(bajtos) handle "address not found"
      const geo = await this.geoService.geocode(todo.remindAtAddress);
      // Encode the coordinates as "lat,lng" (Google Maps API format). See also
      // https://stackoverflow.com/q/7309121/69868
      // https://gis.stackexchange.com/q/7379
      todo.remindAtGeo = `${geo[0].y},${geo[0].x}`;
    }
    return await this.todoRepo.create(todo);
  }

  @responses({
    '200': {
      description: 'Todo model instance',
      content: {'application/json': {schema: Todo}},
    },
  })
  @get('/todos/{id}')
  async findTodoById(
    @param.path.number('id') id: number,
    @param.query.boolean('items') items?: boolean,
  ): Promise<Todo> {
    return await this.todoRepo.findById(id);
  }

  @responses({
    '200': {
      description: 'Array of Todo model instances',
      content: {
        'application/json': {schema: {type: 'array', items: Todo}},
      },
    },
  })
  @get('/todos')
  async findTodos(): Promise<Todo[]> {
    return await this.todoRepo.find();
  }

  @responses({
    '200': {
      description: 'Put success',
      content: {'application/json': {schema: {type: 'boolean'}}},
    },
  })
  @put('/todos/{id}')
  async replaceTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    return await this.todoRepo.replaceById(id, todo);
  }

  @responses({
    '200': {
      description: 'Patch success',
      content: {'application/json': {schema: {type: 'boolean'}}},
    },
  })
  @patch('/todos/{id}')
  async updateTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    return await this.todoRepo.updateById(id, todo);
  }

  @responses({
    '200': {
      description: 'Delete success',
      content: {'application/json': {schema: {type: 'boolean'}}},
    },
  })
  @del('/todos/{id}')
  async deleteTodo(@param.path.number('id') id: number): Promise<boolean> {
    return await this.todoRepo.deleteById(id);
  }
}
