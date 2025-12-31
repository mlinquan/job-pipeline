import { EventEmitter } from 'events';

// 定义常量
const constants = {
    EVENT_PIPELINE_START: 'pipelineStart',
    EVENT_STEP_UPDATE: 'stepUpdate',
    EVENT_ERROR: 'error',
    EVENT_COMPLETED: 'completed',
    EVENT_TERMINATED: 'terminated',
    STEP_START: 'start',
};
// 定义PipelineData类
class PipelineData {
    constructor(data, step = constants.STEP_START) {
        this.data = data;
        this.step = step;
    }
}
class JobPipeline extends EventEmitter {
    constructor(config = {}) {
        super();
        this.tasks = [];
        this.preMiddlewares = [];
        this.postMiddlewares = [];
        this.continueExecution = true;
        this.debug = config.debug ?? false;
        this.logger = config.logger ?? ((message) => console.log(message));
    }
    // 使用自定义的logger
    log(message) {
        if (this.debug) {
            this.logger(message);
        }
    }
    addTask(task) {
        this.tasks.push(task);
    }
    addPreMiddleware(middleware) {
        this.preMiddlewares.push(middleware);
    }
    addPostMiddleware(middleware) {
        this.postMiddlewares.push(middleware);
    }
    async executeMiddlewares(middlewares, data) {
        this.log(`Starting middlewares for step ${data.step}`);
        for (const middleware of middlewares) {
            await middleware(data);
            this.log(`Middleware completed for step ${data.step}`);
        }
    }
    async executePipeline(initialData) {
        let currentData = new PipelineData(initialData);
        this.log('Starting pipeline execution.');
        this.emit(constants.EVENT_PIPELINE_START, currentData);
        try {
            while (this.continueExecution && this.tasks.length > 0) {
                await this.executeMiddlewares(this.preMiddlewares, currentData);
                if (!this.continueExecution) {
                    this.log('Pipeline execution terminated by pre-middleware.');
                    break;
                }
                const task = this.tasks.shift();
                if (!task) {
                    this.log('No more tasks to execute.');
                    break;
                }
                this.log(`Executing task with data: ${currentData.data}`);
                currentData = await task(currentData);
                this.emit(constants.EVENT_STEP_UPDATE, currentData);
                this.log(`Task completed with data: ${currentData.data}`);
                await this.executeMiddlewares(this.postMiddlewares, currentData);
                if (!this.continueExecution) {
                    this.log('Pipeline execution terminated by post-middleware.');
                }
            }
            if (this.continueExecution) {
                this.emit(constants.EVENT_COMPLETED, currentData);
                this.log('Pipeline completed successfully.');
            }
        }
        catch (error) {
            this.terminate();
            this.log(`Pipeline execution error: ${error.message || error}`);
        }
    }
    complete() {
        this.continueExecution = false;
        this.emit(constants.EVENT_COMPLETED);
        this.log('Pipeline execution completed.');
    }
    terminate() {
        this.continueExecution = false;
        this.emit(constants.EVENT_TERMINATED, new Error('Pipeline execution was manually terminated.'));
        this.log('Pipeline execution was manually terminated.');
    }
}

export { JobPipeline, PipelineData, constants };
