import { Request, Response } from 'express';
import CameraStream from './stream/Camera';

const getNewStream = () => new CameraStream(process.env.ONVIF_URL, {
    user: process.env.USER,
    pass: process.env.PASS
});

let stream = getNewStream();

export const rootHandler = (_req: Request, res: Response) => {
    
    res.set('Content-Type', 'video/webm');
    res.status(206);
    res.removeHeader('X-Powered-By');
    
    if (!stream) {
        console.log('No stream detected. Starting new one.')
        stream = getNewStream();
    }

    if (!stream.isStreaming) {
        stream.connect((info, err) => {
            stream.startStream();
        });
    } else {
        console.log('isStreaming');
        // stream.subscribe(chunk => console.log(chunk));
    }

    stream.subscribe((data) => {
        res.write(data);
    });

    stream.onEnd(() => {
        console.log('isEnded');
        res.end();
    });

    console.log(stream);
};
