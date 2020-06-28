import Onvif from './Onvif';
import stream from 'stream';
import FfmpegCommand from 'fluent-ffmpeg';

interface CameraOptions {
    user: string,
    pass: string
};

const defaultOptions: CameraOptions = {
    user: '',
    pass: ''
};

class CameraStream extends Onvif{
    uri: string;
    options: CameraOptions;
    isStreaming: boolean;
    #subscribers: Array<Function>;
    #stream: any;
    #command: string;
    #onEndCallback: Function;

    constructor(uri: string, options: CameraOptions = defaultOptions) {
        super(uri, {
            user: options.user,
            pass: options.pass
        });
        this.uri = uri;
        this.options = options;
        this.#subscribers = [];
        this.isStreaming = false;
        return this;
    }

    subscribe(watcher: Function): CameraStream {
        this.#subscribers.push(watcher);
        return this;
    }

    unsubscribe(watcher: Function): CameraStream {
        this.#subscribers.splice(
            this.#subscribers.indexOf(watcher), 1
        );
        return this;
    }

    stream(): CameraStream {
        const $this = this;
        const outputStream = new stream.Duplex({
            write: function(chunk, encoding, next) {
                $this.#subscribers.forEach(push => {
                    push(chunk);
                });
                next();
            }
        })
        
        this.#stream
        // .on('codecData', (data)=>{
        //     console.log(data);
        // })
        .format('webm')
        .size('720x?')
        .fps(25)
        .outputOptions('-c:v', 'vp9').pipe(outputStream, { end: true })
        return this;
    }

    startStream(): CameraStream {
        this.getStreamUrl(() => {
            this.streamUri = `rtsp://${this.options.user}:${this.options.pass}@${this.streamUri.substring(7)}`;
            this.#stream = new FfmpegCommand(this.streamUri);

            this.#stream.on('start', (cmd) => {
                console.log(cmd);
                this.#command = cmd;
            });

            this.stream();
            this.isStreaming = true;
            this.#stream.on('end', () => {
                this.isStreaming = false;
                this.#onEndCallback();
            });
        });
        return this;
    }

    stopStream(): CameraStream {
        this.#stream.kill('SIGSTOP');
        this.isStreaming = false;
        return this;
    }

    resumeStream(): CameraStream {
        this.#stream.kill('SIGCONT');
        return this;
    }

    killStream(): CameraStream {
        console.log('Killing ffmpeg');
        this.#stream.kill();
        this.isStreaming = false;
        return this;
    }

    getFfmpegCommand(): string {
        return this.#command;
    }
    
    onEnd(cb: Function): CameraStream {
        // this.#stream.on('end', cb);
        this.#onEndCallback = cb;
        return this;
    }



}


export default CameraStream