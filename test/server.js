import test from 'ava';
import request from 'supertest';
import winston from 'winston';
import sinon from 'sinon';

import SpyLogger from './helpers/spy-logger-transport';

import { createServer } from '../src/server';

const createMockLogger = spy => (
    new winston.Logger({
        transports: [
            new SpyLogger(spy),
        ],
    })
);

const jsonize = obj => JSON.parse(JSON.stringify(obj));

test('Getting the ideas endpoint should return the public properties of the source db ideas in json format', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const db = {
        ideas: {
            list: () => [
                { _id: '1', _privateField: 42, title: 'idea 1', body: 'body 1' },
                { _id: '2', _privateField: 42, title: 'idea 2' },
                { _id: '3', _privateField: 42, title: 'idea 3', body: 'body 3' },
            ],
        },
    };

    const ideas = [
        { id: '1', title: 'idea 1', body: 'body 1' },
        { id: '2', title: 'idea 2' },
        { id: '3', title: 'idea 3', body: 'body 3' },
    ];

    // act
    const server = createServer({ logger, db });
    const response = await request(server).get('/ideas');

    // assert
    t.is(response.status, 200);
    t.is(response.get('Content-Type'), 'application/json');
    t.deepEqual(response.body, jsonize(ideas));

});

test('Getting a single idea should return the public properties of the source db idea in json format', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const db = {
        ideas: {
            getById: () => ({ _id: '42', _privateField: 42, title: 'idea 1', body: 'body 1' }),
        },
    };

    const idea = { id: '42', title: 'idea 1', body: 'body 1' };

    // act
    const server = createServer({ logger, db });
    const response = await request(server).get('/ideas/42');

    // assert
    t.is(response.status, 200);
    t.is(response.get('Content-Type'), 'application/json');
    t.deepEqual(response.body, jsonize(idea));

});

test('Getting a non existent idea should return a 404 status', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const db = {
        ideas: {
            getById: () => null,
        },
    };

    // act
    const server = createServer({ logger, db });
    const response = await request(server).get('/ideas/42');

    // assert
    t.is(response.status, 404);

});

test('Creating a new idea should create a new idea at the source db and return the public properties in json format', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const now = new Date();

    const clock = {
        now: () => now,
    };

    const db = {
        ideas: {
            create: idea => Object.assign({ _id: '42', _privateField: 42 }, idea),
        },
    };

    const idea = { id: '42', createdAt: now, modifiedAt: now, title: 'idea 1', body: 'body 1' };

    // act
    const server = createServer({ logger, clock, db });
    const response = await request(server)
        .post('/ideas')
        .send({ title: 'idea 1', body: 'body 1' });

    // assert
    t.is(response.status, 200);
    t.is(response.get('Content-Type'), 'application/json');
    t.deepEqual(response.body, jsonize(idea));

});

test('Creating a new idea with a title that is too long should return a 400 validation error', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const db = {
        ideas: {
        },
    };

    // act
    const server = createServer({ logger, db });
    const response = await request(server)
        .post('/ideas')
        .send({ title: '1234, 19 characters' });

    // assert
    t.is(response.status, 400);

});

test('Creating a new idea with a body that is too long should return a 400 validation error', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const db = {
        ideas: {
        },
    };

    // act
    const server = createServer({ logger, db });
    const response = await request(server)
        .post('/ideas')
        .send({ body: '12, 131 characters, bacon ipsum dolor amet pork porchetta ham ground round corned beef, capicola salami. Biltong alcatra beef salami capicola' });

    // assert
    t.is(response.status, 400);

});

test('Updating an idea should update the existing idea at the source db and return the public properties in json format', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const createdAt = new Date(1985, 2, 18);
    const now = new Date();

    const clock = {
        now: () => now,
    };

    const db = {
        ideas: {
            updateById: (id, idea) => Object.assign({ _id: id, _privateField: 42, createdAt }, idea),
        },
    };

    const idea = { id: '42', createdAt, modifiedAt: now, title: 'idea 1', body: 'body 1' };

    // act
    const server = createServer({ logger, clock, db });
    const response = await request(server)
        .put('/ideas/42')
        .send({ title: 'idea 1', body: 'body 1' });

    // assert
    t.is(response.status, 200);
    t.is(response.get('Content-Type'), 'application/json');
    t.deepEqual(response.body, jsonize(idea));

});

test('Updating a non existent idea should return a 404 status', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const db = {
        ideas: {
            updateById: () => null,
        },
    };

    // act
    const server = createServer({ logger, db });
    const response = await request(server)
        .put('/ideas/42')
        .send({ title: 'idea 1', body: 'body 1' });

    // assert
    t.is(response.status, 404);

});

test('Updating an idea with a title that is too long should return a 400 validation error', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const db = {
        ideas: {
        },
    };

    // act
    const server = createServer({ logger, db });
    const response = await request(server)
        .put('/ideas/42')
        .send({ title: '1234, 19 characters' });

    // assert
    t.is(response.status, 400);

});

test('Updating an idea with a body that is too long should return a 400 validation error', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const db = {
        ideas: {
        },
    };

    // act
    const server = createServer({ logger, db });
    const response = await request(server)
        .put('/ideas/42')
        .send({ body: '12, 131 characters, bacon ipsum dolor amet pork porchetta ham ground round corned beef, capicola salami. Biltong alcatra beef salami capicola' });

    // assert
    t.is(response.status, 400);

});

test('Removing an idea should remove the existing idea at the source db and return the public properties in json format', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const db = {
        ideas: {
            deleteById: id => ({ _id: id, _privateField: 42, title: 'idea 1', body: 'body 1' }),
        },
    };

    const idea = { id: '42', title: 'idea 1', body: 'body 1' };

    // act
    const server = createServer({ logger, db });
    const response = await request(server)
        .del('/ideas/42');

    // assert
    t.is(response.status, 200);
    t.is(response.get('Content-Type'), 'application/json');
    t.deepEqual(response.body, jsonize(idea));

});

test('Removing a non existent idea should return a 404 status', async t => {

    // arrange
    const spy = sinon.spy();
    const logger = createMockLogger(spy);

    const db = {
        ideas: {
            deleteById: () => null,
        },
    };

    // act
    const server = createServer({ logger, db });
    const response = await request(server)
        .del('/ideas/42');

    // assert
    t.is(response.status, 404);

});
