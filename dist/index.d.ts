import { EventEmitter } from 'events';

declare const constants: {
    EVENT_PIPELINE_START: string;
    EVENT_STEP_UPDATE: string;
    EVENT_ERROR: string;
    EVENT_COMPLETED: string;
    EVENT_TERMINATED: string;
    STEP_START: string;
};
declare class PipelineData {
    data: string;
    step: string;
    constructor(data: string, step?: string);
}
declare class JobPipeline extends EventEmitter {
    private tasks;
    private preMiddlewares;
    private postMiddlewares;
    private continueExecution;
    private debug;
    private logger;
    constructor(config?: {
        debug?: boolean;
        logger?: (message: string) => void;
    });
    private log;
    addTask(task: (data: PipelineData) => Promise<PipelineData>): void;
    addPreMiddleware(middleware: (data: PipelineData) => Promise<void>): void;
    addPostMiddleware(middleware: (data: PipelineData) => Promise<void>): void;
    executeMiddlewares(middlewares: Array<(data: PipelineData) => Promise<void>>, data: PipelineData): Promise<void>;
    executePipeline(initialData: string): Promise<void>;
    complete(): void;
    terminate(): void;
}

export { JobPipeline, PipelineData, constants };
