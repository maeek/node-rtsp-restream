import { OnvifDevice } from 'node-onvif';

interface ConnectionOptions {
    xaddr: String,
    user: String,
    pass: String
}

interface DeviceInformation {
    manufacturer: string,
    model: string,
    firmwareVer: string,
    sn: string,
    hardwareId: string
}

class Onvif {
    #onvifCon: any;
    #connection: ConnectionOptions;
    #isConnected: boolean;
    #connectCallback: Function;
    streamUri: string;
    #deviceInfo: DeviceInformation;

    constructor(uri: string, { user, pass } : { user: string, pass: string }) {
        this.#connection = {
            xaddr: uri ?? '',
            user: user ?? '',
            pass: pass ?? ''
        };
    }

    set uri(uri: String) {
        this.#connection.xaddr = uri;
    }

    setCredentials(user: String, pass: String): Onvif {
        this.#connection.user = user;
        this.#connection.pass = pass;
        return this;
    }

    setConnectHandler(connectCallback: Function): Onvif {
        this.#connectCallback = connectCallback;
        return this;
    }

    getStreamUrl(cb?: Function): void {
        const $this = this;
        if (this.isConnected) {
            this.#onvifCon.init().then(() => {
                const uri = this.#onvifCon.getUdpStreamUrl();
                $this.streamUri = uri;
                console.log(uri);
                cb(uri);
            });
        } else {
            throw new Error('Connection with camera is not initialised.');
        }
    }

    getDeviceInfo(cb?: Function): Onvif {
        if (this.isConnected && !this.#deviceInfo) {
            this.#onvifCon.getDeviceInformation((info) => {
                this.#deviceInfo = info;
                cb && cb(info);
            });
        } else if (this.isConnected && this.#deviceInfo) {
            cb && cb(this.#deviceInfo);
        }
        return this;
    }

    get isConnected(): boolean {
        return this.#isConnected;
    }

    connect(callback: Function): Onvif {
        const $this = this;
        const cb = function(info: any) {
            $this.#isConnected = true;
            $this.#connectCallback && $this.#connectCallback();
            callback(info);
        };

        if (!this.#onvifCon) {
            this.#onvifCon = new OnvifDevice(this.#connection);
            this.#onvifCon.init().then(cb).catch(e => callback(null, e));
        } else {
            this.#onvifCon.connect(cb);
        }
        return this;
    }
}

export default Onvif;