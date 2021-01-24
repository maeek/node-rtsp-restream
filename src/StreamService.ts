import { Duplex } from "stream";
import ffmpeg from 'fluent-ffmpeg';

class StreamService extends Function {
  _bound: Function;
  
  private uri: string;
  private subscribers: Function[] = [];
  private stream: any;
  private cmd: string;

  constructor(uri: string) {
    super('...args', 'return this._bound._call(...args)');
    this._bound = this.bind(this);

    this.uri = uri;
    this.stream = ffmpeg(this.uri);
  }

  _call(...args: any): void {
    console.log(args);
  }

  get ffmpeg(): string {
    return this.cmd
  };

  watch(watcher: Function): StreamService {
    this.subscribers.push(watcher);
    return this;
  }

  stopWatching(watcher: Function): StreamService {
    this.subscribers.splice(
      this.subscribers.indexOf(watcher), 1
    );
    return this;
  }

  start(): StreamService {
    this.stream.on('start', (cmd: string) => {
      console.log('# STREAM - started')
      this.cmd = cmd;
    });

    this.stream.on('end', (stdout: string, stderr: string) => {
      console.log('# STREAM - ended')
      this.onEnd(stdout, stderr);
    });

    this.stream.on('codecData', (codecs: string) => {
      console.log('# Codecs')
      console.log(codecs);
    });

    this.stream.on('error', (err: NodeJS.ErrnoException, stdout: string, stderr: string) => {
      console.log('# STREAM - error: ' + err);
      this.onError(err, stdout, stderr);
    });

    this.broadcast();

    return this;
  }

  stop() {
    this.stream.kill('SIGSTOP');
  }

  kill() {
    this.stream.kill();
  }
  
  onEnd(stdout: string, stderr: string) {}
  onError(error: NodeJS.ErrnoException, stdout: string, stderr: string) {
    console.log(error);
    console.log(stdout);
    console.log(stderr);
  }

  private broadcast(): StreamService {
    const output = new Duplex({
      write: (chunk, encoding, next) => {
        this.subscribers.forEach((watch: Function) => watch(chunk, encoding));
        next();
      }
    });

    this.stream
      .format('webm')
      .videoCodec('libvpx')
      .audioCodec('libvorbis')
      // .outputOptions('-c:v', 'libtheora')
      // .outputOptions('-c:a', 'libvorbis')
      .pipe(output);
    
    console.log(this.ffmpeg);

    return this;
  }

}

export default StreamService;
