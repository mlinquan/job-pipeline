# Pipeline Job

A simple and flexible job pipeline implementation in TypeScript, allowing you to create and execute a sequence of asynchronous tasks with middleware support.

## Repository

[GitHub: https://github.com/mlinquan/pipeline-job](https://github.com/mlinquan/pipeline-job)

## Features

- 🚀 **Asynchronous Task Execution**: Run a sequence of async tasks in a pipeline
- 🔧 **Middleware Support**: Add pre and post middleware to each step
- 🎛️ **Event-driven**: Listen to pipeline events for monitoring and control
- 📋 **Debug Mode**: Enable debug logging for development
- 🛑 **Termination Support**: Manually terminate or complete the pipeline at any point
- ✅ **TypeScript Support**: Full TypeScript type definitions
- 🌐 **Browser Support**: Works seamlessly in browsers with UMD and ES module support
- 📦 **Multiple Output Formats**: Available as CommonJS, ES Module, and UMD

## Installation

```bash
npm install pipeline-job
```

## Usage

### Basic Example

```typescript
import { constants, PipelineData, JobPipeline } from 'pipeline-job';

// Define tasks
const tasks = [
    async (data: any) => new PipelineData(`${data.data} processed by Task 1`, 'task1'),
    async (data: any) => new PipelineData(`${data.data} processed by Task 2`, 'task2'),
];

// Create pipeline instance
const jobPipeline = new JobPipeline();

// Add tasks to pipeline
tasks.forEach(task => {
    jobPipeline.addTask(task);
});

// Execute pipeline
jobPipeline.executePipeline('initial data').catch(error => {
    console.error(`Pipeline failed with error: ${error.message}`);
});
```

### Advanced Example with Middleware and Events

```typescript
import { constants, PipelineData, JobPipeline } from 'pipeline-job';

// Define tasks
const tasks = [
    async (data: any) => new PipelineData(`${data.data} processed by Task 1`, 'task1'),
    async (data: any) => new PipelineData(`${data.data} processed by Task 2`, 'task2'),
];

// Define pre middleware
const preMiddlewares = [
    async (data: any) => {
        console.log(`Pre-middleware for step ${data.step}:`, data.data);
    },
];

// Define post middleware
const postMiddlewares = [
    async (data: any) => {
        console.log(`Post-middleware for step ${data.step}:`, data.data);
    },
];

// Create pipeline instance with debug mode
const jobPipeline = new JobPipeline({ debug: true });

// Add tasks and middleware
tasks.forEach(task => jobPipeline.addTask(task));
preMiddlewares.forEach(middleware => jobPipeline.addPreMiddleware(middleware));
postMiddlewares.forEach(middleware => jobPipeline.addPostMiddleware(middleware));

// Listen to events
jobPipeline.on(constants.EVENT_PIPELINE_START, (data) => {
    console.log(`Pipeline started with data: ${data.data}`);
});

jobPipeline.on(constants.EVENT_STEP_UPDATE, (data) => {
    console.log(`Step updated: ${data.step} with data: ${data.data}`);
});

jobPipeline.on(constants.EVENT_COMPLETED, (data) => {
    console.log(`Pipeline completed with final data: ${data.data}`);
});

jobPipeline.on(constants.EVENT_ERROR, (error) => {
    console.error(`Pipeline error: ${error.message}`);
});

jobPipeline.on(constants.EVENT_TERMINATED, (error) => {
    console.log(`Pipeline terminated: ${error.message}`);
});

// Execute pipeline
jobPipeline.executePipeline('initial data').catch(error => {
    console.error(`Pipeline failed with error: ${error.message}`);
});
```

## API Reference

### JobPipeline Class

#### Constructor

```typescript
new JobPipeline(config?: { debug?: boolean; logger?: (message: string) => void })
```

- `debug`: Enable debug logging (default: `false`)
- `logger`: Custom logger function (default: `console.log`)

#### Methods

##### `addTask(task: (data: PipelineData) => Promise<PipelineData>): void`
Adds a task to the pipeline.

##### `addPreMiddleware(middleware: (data: PipelineData) => Promise<void>): void`
Adds a pre-middleware to the pipeline.

##### `addPostMiddleware(middleware: (data: PipelineData) => Promise<void>): void`
Adds a post-middleware to the pipeline.

##### `executePipeline(initialData: string): Promise<void>`
Starts executing the pipeline with the given initial data.

##### `complete(): void`
Completes the pipeline execution.

##### `terminate(): void`
Terminates the pipeline execution with an error.

### PipelineData Class

#### Constructor

```typescript
new PipelineData(data: string, step: string = constants.STEP_START)
```

- `data`: The data to be processed
- `step`: The current step name (default: `'start'`)

### Constants

```typescript
const constants = {
  EVENT_PIPELINE_START: 'pipelineStart',
  EVENT_STEP_UPDATE: 'stepUpdate',
  EVENT_ERROR: 'error',
  EVENT_COMPLETED: 'completed',
  EVENT_TERMINATED: 'terminated',
  STEP_START: 'start',
};
```

## Events

The JobPipeline class extends EventEmitter and emits the following events:

- `pipelineStart`: Emitted when the pipeline starts
- `stepUpdate`: Emitted after each task completes
- `error`: Emitted when an error occurs
- `completed`: Emitted when the pipeline completes successfully
- `terminated`: Emitted when the pipeline is terminated

## Development

### Building the Project

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Running Tests in Watch Mode

```bash
npm run test:watch
```

## Browser Support

JobPipeline supports all modern browsers through multiple module formats. Here's how to use it in different browser environments:

### 1. Using UMD via Script Tag

The simplest way to use JobPipeline in the browser is to include the UMD build via a script tag:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JobPipeline Browser Test</title>
    <!-- Include the UMD build -->
    <script src="https://unpkg.com/pipeline-job/dist/index.umd.js"></script>
</head>
<body>
    <h1>JobPipeline Browser Test</h1>
    <div id="output"></div>
    
    <script>
        // Access JobPipeline from the global window object
        const { constants, PipelineData, JobPipeline } = window.JobPipeline;
        
        // Create and use the pipeline
        const jobPipeline = new JobPipeline({ debug: true });
        
        // Define tasks
        const tasks = [
            async (data) => new PipelineData(`${data.data} processed by Task 1`, 'task1'),
            async (data) => new PipelineData(`${data.data} processed by Task 2`, 'task2'),
        ];
        
        // Add tasks
        tasks.forEach(task => jobPipeline.addTask(task));
        
        // Execute pipeline
        jobPipeline.executePipeline('initial data');
        
        // Listen to events
        jobPipeline.on(constants.EVENT_COMPLETED, (data) => {
            console.log('Pipeline completed!', data);
        });
    </script>
</body>
</html>
```

### 2. Using ES Modules in Modern Browsers

For modern browsers that support ES modules, you can use the ES module build:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JobPipeline ES Module Test</title>
</head>
<body>
    <h1>JobPipeline ES Module Test</h1>
    
    <script type="module">
        // Import directly from the CDN
        import { constants, PipelineData, JobPipeline } from 'https://unpkg.com/pipeline-job/dist/index.esm.js';
        
        // Create and use the pipeline
        const jobPipeline = new JobPipeline({ debug: true });
        
        // Define tasks
        const tasks = [
            async (data) => {
                console.log('Executing Task 1');
                return new PipelineData(`${data.data} processed by Task 1`, 'task1');
            },
            async (data) => {
                console.log('Executing Task 2');
                return new PipelineData(`${data.data} processed by Task 2`, 'task2');
            },
        ];
        
        // Add tasks and execute
        tasks.forEach(task => jobPipeline.addTask(task));
        jobPipeline.executePipeline('initial data');
    </script>
</body>
</html>
```

### 3. Using with Build Tools (Webpack, Vite, Rollup)

If you're using a build tool like Webpack, Vite, or Rollup, you can import JobPipeline like any other npm package:

```typescript
// Import in your TypeScript/JavaScript file
import { constants, PipelineData, JobPipeline } from 'pipeline-job';

// Use as usual
const jobPipeline = new JobPipeline();
// ...
```

## Example

### Node.js Example

You can find a complete Node.js example in the `demo.ts` file at the project root:

```bash
npm run build
node dist/demo.js
```

### Browser Example

The project includes a comprehensive browser test file `test-browser.html` that demonstrates all features in a visual way:

```bash
# Build the project first
npm run build

# Then open the test file in your browser
open test-browser.html
```

This browser example shows:
- Multiple tasks with different delays (500ms, 800ms, 300ms, 1000ms, 600ms)
- Real-time event listening and logging
- Status tracking with start/end times
- Color-coded visual output for better readability
- Total execution time calculation
- Complete pipeline lifecycle demonstration

The test file is designed to be self-contained and can be opened directly in any modern browser after building the project.

## License

MIT

## Copyright

© LinQuan 2025-present
