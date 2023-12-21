import clone from 'lodash/clone.js';

import { sleep } from './Utilities.js';

export interface Request {
    callback: (result: any) => void;
    reject: (err: any) => void;
    func: () => any;
}

export class FuncQueue {
    private queuedRequests: Request[] = [];

    private running: boolean = false;

    constructor() {
    }

    public async init() {
        if (this.running) {
            return;
        }

        this.running = true;
        this.rpcLoop();
    }

    public async stop() {
        this.running = false;
    }

    public async runOnceQueueEmpty<T>(func: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> {
        const boundFunc = new Promise<T>((res, rej) => {
            this.queuedRequests.push({
                callback: res,
                reject: rej,
                func: func.bind(null, ...args),
            });
        });

        return boundFunc;
    }

    private async rpcLoop() {
        while (this.running) {
            await sleep(200);

            const requestsToProcess = clone(this.queuedRequests);

            this.queuedRequests = [];

            for (const request of requestsToProcess) {
                try {
                    const response = await request.func();
                    request.callback(response);
                } catch (err) {
                    request.reject(err);
                }
            }
        }
    }
}
