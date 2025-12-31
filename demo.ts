import { constants, PipelineData, JobPipeline } from './src/index';

// 定义任务
const tasks = [
    async (data: any) => new PipelineData(`${data.data} processed by Task 1`, 'task1'),
    async (data: any) => new PipelineData(`${data.data} processed by Task 2`, 'task2'),
    // 可以添加更多的任务
];

// 定义前置中间件
const preMiddlewares = [
    async (data: any) => {
        console.log(`Pre-middleware for step ${data.step}:`, data.data);
    },
];

// 定义后置中间件
const postMiddlewares = [
    async (data: any) => {
        console.log(`Post-middleware for step ${data.step}:`, data.data);
        // 可以在这里添加逻辑来提前终止pipeline
    },
];

// 创建pipeline实例，并设置调试模式为true
const jobPipelineDebug = new JobPipeline({ debug: true });
const jobPipelineNoDebug = new JobPipeline({ debug: false });
const jobPipelineDefault = new JobPipeline();

// 添加任务和中间件
tasks.forEach(task => {
    jobPipelineDebug.addTask(task);
    jobPipelineNoDebug.addTask(task);
    jobPipelineDefault.addTask(task);
});
preMiddlewares.forEach(middleware => {
    jobPipelineDebug.addPreMiddleware(middleware);
    jobPipelineNoDebug.addPreMiddleware(middleware);
    jobPipelineDefault.addPreMiddleware(middleware);
});
postMiddlewares.forEach(middleware => {
    jobPipelineDebug.addPostMiddleware(middleware);
    jobPipelineNoDebug.addPostMiddleware(middleware);
    jobPipelineDefault.addPostMiddleware(middleware);
});

// 监听事件
jobPipelineDebug.on(constants.EVENT_PIPELINE_START, (data) => {
    console.log(`Pipeline started with data: ${data.data}`);
});
// ...注册其他事件监听器

// 启动pipeline
jobPipelineDebug.executePipeline('initial data').catch(error => {
    console.error(`Pipeline failed with error: ${error.message}`);
});