class Logger {
    constructor(context = "Log") {
        this.context = context;
    }

    log(type, color, ...args) {
        const reset = "\x1b[0m";
        console.log(`${color}[${this.context} - ${type}]${reset}`, ...args);
    }

    info(...args) {
        this.log("INFO", "\x1b[34m", ...args);
    }

    success(...args) {
        this.log("SUCCESS", "\x1b[32m", ...args);
    }

    error(...args) {
        this.log("ERROR", "\x1b[31m", ...args);
    }
}

export default Logger;