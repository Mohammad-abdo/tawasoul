import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { io as ioClient } from 'socket.io-client';
import express from 'express';
import { initSocket } from '../src/socket/index.js';

const waitFor = (emitter, event) =>
  new Promise((resolve, reject) => {
    const onEvent = (...args) => {
      cleanup();
      resolve(args);
    };
    const onError = (err) => {
      cleanup();
      reject(err);
    };
    const cleanup = () => {
      emitter.off(event, onEvent);
      emitter.off('connect_error', onError);
      emitter.off('error', onError);
    };
    emitter.on(event, onEvent);
    emitter.on('connect_error', onError);
    emitter.on('error', onError);
  });

describe('socket lifecycle (user/doctor)', () => {
  let httpServer;
  let port;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    const app = express();
    httpServer = createServer(app);
    initSocket(httpServer);

    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        port = httpServer.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (!httpServer) return;
    await new Promise((resolve) => httpServer.close(resolve));
  });

  test('doctor connects and can join doctor room (auth required)', async () => {
    const token = jwt.sign({ role: 'DOCTOR', doctorId: 'doc-1' }, process.env.JWT_SECRET);
    const client = ioClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ['websocket'],
    });

    await waitFor(client, 'connect');

    // join-doctor should be accepted only for matching id (no error expected)
    client.emit('join-doctor', 'doc-1');
    client.disconnect();
  });

  test('user connects and can join user room (auth required)', async () => {
    const token = jwt.sign({ role: 'USER', userId: 'user-1' }, process.env.JWT_SECRET);
    const client = ioClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ['websocket'],
    });

    await waitFor(client, 'connect');
    client.emit('join-user', 'user-1');
    client.disconnect();
  });

  test('rejects connection without token', async () => {
    const client = ioClient(`http://localhost:${port}`, {
      transports: ['websocket'],
    });

    await expect(waitFor(client, 'connect')).rejects.toBeTruthy();
    client.disconnect();
  });
});

