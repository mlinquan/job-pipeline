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
  constructor(public data: string, public step: string = constants.STEP_START) {}
}

class JobPipeline extends EventEmitter {
  private tasks: Array<(data: PipelineData) => Promise<PipelineData>> = [];
  private preMiddlewares: Array<(data: PipelineData) => Promise<void>> = [];
  private postMiddlewares: Array<(data: PipelineData) => Promise<void>> = [];
  private continueExecution: boolean = true;
  private debug: boolean;
  private logger: (message: string) => void;

  constructor(config: { debug?: boolean; logger?: (message: string) => void } = {}) {
    super();
    this.debug = config.debug ?? false;
    this.logger = config.logger ?? ((message) => console.log(message));
  }

  // 使用自定义的logger
  private log(message: string) {
    if (this.debug) {
      this.logger(message);
    }
  }

  addTask(task: (data: PipelineData) => Promise<PipelineData>) {
    this.tasks.push(task);
  }

  addPreMiddleware(middleware: (data: PipelineData) => Promise<void>) {
    this.preMiddlewares.push(middleware);
  }

  addPostMiddleware(middleware: (data: PipelineData) => Promise<void>) {
    this.postMiddlewares.push(middleware);
  }

  async executeMiddlewares(middlewares: Array<(data: PipelineData) => Promise<void>>, data: PipelineData): Promise<void> {
    this.log(`Starting middlewares for step ${data.step}`);
    for (const middleware of middlewares) {
      await middleware(data);
      this.log(`Middleware completed for step ${data.step}`);
    }
  }

  async executePipeline(initialData: string) {
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
    } catch (error: any) {
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

export { constants, PipelineData, JobPipeline };