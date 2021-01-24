import 'dotenv';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import StreamService from './StreamService';

const app = express();
const transport = http.createServer(app);
const io = new Server(transport);

const stream = new StreamService(process.env.RTSP_URI);

io.on('connection', (socket) => {
  console.log('Connected');

  stream.watch((chunk: any, encoding: any) => {
    socket.emit('vs', chunk);
    console.log('streaming');
  })

  socket.on('start', () => {
    stream.start();
    console.log('stream started');
  })

  socket.on('stop', () => {
    stream.stop();
    console.log('stream stopped');
  })

  socket.on('disconnect', () => {
    stream.stop();
    console.log('stream stopped');
  })

  socket.emit('test');
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './index.html'));
});

transport.listen(3000, () => {
  console.log('listening on *:3000');
});
