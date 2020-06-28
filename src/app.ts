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
import { rootHandler } from './handlers';

const app = express();
const port = process.env.PORT || '3000';

app.get('/', rootHandler);

app.listen(port, err => {
    if (err) return console.error(err);
    return console.log(`Server is listening on ${port}`);
});