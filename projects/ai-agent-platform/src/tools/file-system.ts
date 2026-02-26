import * as fs from 'fs';
import * as path from 'path';
import { Tool } from '../core/agent';

export const readFileTool: Tool = {
  name: 'read_file',
  description: 'Read the contents of a file from the filesystem.',
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the file to read',
      },
    },
    required: ['file_path'],
  },
  execute: async (file_path: string): Promise<string> => {
    try {
      const resolved = path.resolve(file_path);
      const content = fs.readFileSync(resolved, 'utf-8');
      return content;
    } catch (error) {
      return `Error reading "${file_path}": ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

export const writeFileTool: Tool = {
  name: 'write_file',
  description:
    'Write content to a file on the filesystem. Creates the file and any missing parent directories.',
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the file to write',
      },
      content: {
        type: 'string',
        description: 'Content to write to the file',
      },
    },
    required: ['file_path', 'content'],
  },
  execute: async (file_path: string, content: string): Promise<string> => {
    try {
      const resolved = path.resolve(file_path);
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, content, 'utf-8');
      return `Wrote ${content.length} characters to "${file_path}"`;
    } catch (error) {
      return `Error writing "${file_path}": ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

export const listDirectoryTool: Tool = {
  name: 'list_directory',
  description: 'List files and subdirectories at a given path.',
  parameters: {
    type: 'object',
    properties: {
      dir_path: {
        type: 'string',
        description: 'Path to the directory to list',
      },
    },
    required: ['dir_path'],
  },
  execute: async (dir_path: string): Promise<string> => {
    try {
      const resolved = path.resolve(dir_path);
      const entries = fs.readdirSync(resolved, { withFileTypes: true });
      if (entries.length === 0) return 'Directory is empty';
      return entries
        .map(e => `${e.isDirectory() ? '[DIR] ' : '[FILE]'} ${e.name}`)
        .join('\n');
    } catch (error) {
      return `Error listing "${dir_path}": ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};
