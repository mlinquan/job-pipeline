import { constants, PipelineData, JobPipeline } from '../src/index';

describe('JobPipeline', () => {
  let jobPipeline: JobPipeline;

  beforeEach(() => {
    jobPipeline = new JobPipeline();
  });

  test('should create a JobPipeline instance with default config', () => {
    expect(jobPipeline).toBeInstanceOf(JobPipeline);
  });

  test('should create a JobPipeline instance with debug mode', () => {
    const debugPipeline = new JobPipeline({ debug: true });
    expect(debugPipeline).toBeInstanceOf(JobPipeline);
  });

  test('should add tasks to the pipeline', () => {
    const task1 = async (data: PipelineData) => new PipelineData(`${data.data} processed by Task 1`, 'task1');
    const task2 = async (data: PipelineData) => new PipelineData(`${data.data} processed by Task 2`, 'task2');

    jobPipeline.addTask(task1);
    jobPipeline.addTask(task2);

    // We can't directly access private tasks array, so we'll test by executing pipeline
    const mockTask = jest.fn(async (data: PipelineData) => new PipelineData(`${data.data} processed`, 'test'));
    const testPipeline = new JobPipeline();
    testPipeline.addTask(mockTask);

    return testPipeline.executePipeline('test data').then(() => {
      expect(mockTask).toHaveBeenCalled();
    });
  });

  test('should add pre-middlewares to the pipeline', () => {
    const preMiddleware = jest.fn(async (data: PipelineData) => {
      // Do nothing
    });

    jobPipeline.addPreMiddleware(preMiddleware);

    // Test by executing pipeline
    const testPipeline = new JobPipeline();
    const testPreMiddleware = jest.fn(async (data: PipelineData) => {});
    const testTask = async (data: PipelineData) => new PipelineData(`${data.data} processed`, 'test');

    testPipeline.addPreMiddleware(testPreMiddleware);
    testPipeline.addTask(testTask);

    return testPipeline.executePipeline('test data').then(() => {
      expect(testPreMiddleware).toHaveBeenCalled();
    });
  });

  test('should add post-middlewares to the pipeline', () => {
    const postMiddleware = jest.fn(async (data: PipelineData) => {
      // Do nothing
    });

    jobPipeline.addPostMiddleware(postMiddleware);

    // Test by executing pipeline
    const testPipeline = new JobPipeline();
    const testPostMiddleware = jest.fn(async (data: PipelineData) => {});
    const testTask = async (data: PipelineData) => new PipelineData(`${data.data} processed`, 'test');

    testPipeline.addPostMiddleware(testPostMiddleware);
    testPipeline.addTask(testTask);

    return testPipeline.executePipeline('test data').then(() => {
      expect(testPostMiddleware).toHaveBeenCalled();
    });
  });

  test('should execute pipeline successfully', () => {
    const task1 = async (data: PipelineData) => new PipelineData(`${data.data} processed by Task 1`, 'task1');
    const task2 = async (data: PipelineData) => new PipelineData(`${data.data} processed by Task 2`, 'task2');

    jobPipeline.addTask(task1);
    jobPipeline.addTask(task2);

    return jobPipeline.executePipeline('initial data').then(() => {
      // If we get here, the pipeline executed successfully
      expect(true).toBe(true);
    });
  });

  test('should emit events during pipeline execution', () => {
    const task1 = async (data: PipelineData) => new PipelineData(`${data.data} processed by Task 1`, 'task1');
    jobPipeline.addTask(task1);

    const eventHandlers = {
      pipelineStart: jest.fn(),
      stepUpdate: jest.fn(),
      completed: jest.fn()
    };

    jobPipeline.on(constants.EVENT_PIPELINE_START, eventHandlers.pipelineStart);
    jobPipeline.on(constants.EVENT_STEP_UPDATE, eventHandlers.stepUpdate);
    jobPipeline.on(constants.EVENT_COMPLETED, eventHandlers.completed);

    return jobPipeline.executePipeline('test data').then(() => {
      expect(eventHandlers.pipelineStart).toHaveBeenCalled();
      expect(eventHandlers.stepUpdate).toHaveBeenCalled();
      expect(eventHandlers.completed).toHaveBeenCalled();
    });
  });

  test('should terminate pipeline when terminate() is called', () => {
    const longRunningTask = async (data: PipelineData) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return new PipelineData(`${data.data} processed`, 'test');
    };

    const terminateMiddleware = async (data: PipelineData) => {
      jobPipeline.terminate();
    };

    jobPipeline.addPreMiddleware(terminateMiddleware);
    jobPipeline.addTask(longRunningTask);

    const terminatedHandler = jest.fn();
    jobPipeline.on(constants.EVENT_TERMINATED, terminatedHandler);

    return jobPipeline.executePipeline('test data').then(() => {
      expect(terminatedHandler).toHaveBeenCalled();
    });
  });

  test('should complete pipeline when complete() is called', () => {
    const completeMiddleware = async (data: PipelineData) => {
      jobPipeline.complete();
    };

    jobPipeline.addPreMiddleware(completeMiddleware);
    jobPipeline.addTask(async (data: PipelineData) => new PipelineData(`${data.data} processed`, 'test'));

    const completedHandler = jest.fn();
    jobPipeline.on(constants.EVENT_COMPLETED, completedHandler);

    return jobPipeline.executePipeline('test data').then(() => {
      expect(completedHandler).toHaveBeenCalled();
    });
  });
});
