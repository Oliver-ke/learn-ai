import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * EXERCISE: Build a Task Management System with Tools
 * 
 * Implement these tools:
 * 1. create_task - Add new task
 * 2. list_tasks - List all tasks (with optional filter)
 * 3. update_task - Update task status
 * 4. delete_task - Remove task
 * 5. search_tasks - Search by keyword
 */

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
}

class TaskManager {
  private tasks: Task[] = [];
  private nextId = 1;

  createTask(
    title: string,
    description: string,
    priority: Task['priority'] = 'medium',
    dueDate?: string
  ): string {
    const task: Task = {
      id: `task-${this.nextId++}`,
      title,
      description,
      status: 'todo',
      priority,
      createdAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined
    };

    this.tasks.push(task);

    return JSON.stringify({
      success: true,
      message: 'Task created successfully',
      task
    });
  }

  listTasks(status?: Task['status'], priority?: Task['priority']): string {
    let filtered = this.tasks;

    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }

    if (priority) {
      filtered = filtered.filter(t => t.priority === priority);
    }

    return JSON.stringify({
      count: filtered.length,
      tasks: filtered
    });
  }

  updateTask(id: string, status: Task['status']): string {
    const task = this.tasks.find(t => t.id === id);

    if (!task) {
      return JSON.stringify({
        success: false,
        error: 'Task not found'
      });
    }

    task.status = status;

    return JSON.stringify({
      success: true,
      message: 'Task updated successfully',
      task
    });
  }

  deleteTask(id: string): string {
    const index = this.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return JSON.stringify({
        success: false,
        error: 'Task not found'
      });
    }

    const deleted = this.tasks.splice(index, 1)[0];

    return JSON.stringify({
      success: true,
      message: 'Task deleted successfully',
      task: deleted
    });
  }

  searchTasks(keyword: string): string {
    const results = this.tasks.filter(t =>
      t.title.toLowerCase().includes(keyword.toLowerCase()) ||
      t.description.toLowerCase().includes(keyword.toLowerCase())
    );

    return JSON.stringify({
      count: results.length,
      tasks: results
    });
  }
}

// Tool definitions
const taskTools = [
  {
    name: 'create_task',
    description: 'Create a new task in the task management system',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Task priority'
        },
        dueDate: {
          type: 'string',
          description: 'Due date in ISO format (optional)'
        }
      },
      required: ['title', 'description']
    }
  },
  {
    name: 'list_tasks',
    description: 'List all tasks, optionally filtered by status or priority',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['todo', 'in-progress', 'done'],
          description: 'Filter by status'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Filter by priority'
        }
      }
    }
  },
  {
    name: 'update_task',
    description: 'Update the status of a task',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        status: {
          type: 'string',
          enum: ['todo', 'in-progress', 'done'],
          description: 'New status'
        }
      },
      required: ['id', 'status']
    }
  },
  {
    name: 'delete_task',
    description: 'Delete a task by ID',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID to delete' }
      },
      required: ['id']
    }
  },
  {
    name: 'search_tasks',
    description: 'Search tasks by keyword in title or description',
    parameters: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Search keyword' }
      },
      required: ['keyword']
    }
  }
];

async function testTaskManagementAgent() {
  const taskManager = new TaskManager();
  
  const toolFunctions: Record<string, Function> = {
    create_task: (...args: any[]) => taskManager.createTask(...args),
    list_tasks: (...args: any[]) => taskManager.listTasks(...args),
    update_task: (...args: any[]) => taskManager.updateTask(...args),
    delete_task: (...args: any[]) => taskManager.deleteTask(...args),
    search_tasks: (...args: any[]) => taskManager.searchTasks(...args),
  };

  const queries = [
    "Create a high priority task called 'Finish AI bootcamp' with description 'Complete all week 2 exercises'",
    "Create another task called 'Buy groceries' with low priority",
    "Show me all my tasks",
    "Mark the AI bootcamp task as in-progress",
    "What tasks do I have in progress?",
  ];

  for (const query of queries) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`👤 User: ${query}`);
    console.log('='.repeat(80) + '\n');

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: 'You are a task management assistant. Help users manage their tasks.' },
      { role: 'user', content: query }
    ];

    let iterations = 0;
    const maxIterations = 5;

    while (iterations < maxIterations) {
      iterations++;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        functions: taskTools,
        function_call: 'auto',
      });

      const responseMessage = response.choices[0].message;
      messages.push(responseMessage);

      if (responseMessage.function_call) {
        const funcName = responseMessage.function_call.name;
        const funcArgs = JSON.parse(responseMessage.function_call.arguments);

        console.log(`🔧 ${funcName}(${JSON.stringify(funcArgs)})`);

        const result = toolFunctions[funcName](...Object.values(funcArgs));
        console.log(`📤 ${result}\n`);

        messages.push({
          role: 'function',
          name: funcName,
          content: result
        });
      } else {
        console.log(`🤖 ${responseMessage.content}\n`);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

testTaskManagementAgent().catch(console.error);