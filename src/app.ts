// import ffmpeg from 'ffmpeg';
// const stream = new Stream({
//     name: "name",
//     streamUrl: url, // rtsp url
//     wsPort: port,  // ws port
//     ffmpegOptions: { // options ffmpeg flags
//         '-stats': '', // an option with no neccessary value uses a blank string
//         '-r': 30 // options with required values specify the value after the key
//     }
// });
import 'dotenv';
import express from 'express';
import http from 'http';
import { rootHandler } from './handlers';
// import Socket from './Socket';

const app = express();
const port = process.env.PORT || '3000';

app.get('/', rootHandler);

const server = http.createServer(app);

// const io = new Socket(server);

server.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});