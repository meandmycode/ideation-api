import winston from 'winston';

export default class SpyLogger extends winston.Transport {

    constructor(spy, options) {
        super(options);
        this.spy = spy;
    }

    log(level, message, meta, callback) {
        this.spy(level, message, meta);
        callback(null, true);
    }
}
