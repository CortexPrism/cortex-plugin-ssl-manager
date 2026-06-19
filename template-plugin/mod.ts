/**
 * CortexPrism Example Plugin
 * 
 * This template demonstrates best practices for building Cortex plugins:
 * - Tool implementation with proper error handling
 * - Lifecycle hooks for initialization and cleanup
 * - Structured logging
 * - Input validation
 * 
 * For complete documentation, see: https://cortexprism.io/docs/developer-guide
 * For CortexPrism standards, see: docs/ folder in this workspace
 */

import type { Tool, PluginContext, ToolResult } from 'cortex/plugins';

/**
 * Greeting tool - Greet a person by name
 */
const helloTool: Tool = {
  definition: {
    name: 'hello',
    description: 'Greet a person by name',
    params: [
      {
        name: 'name',
        type: 'string',
        description: 'The person\'s name',
        required: true,
      }
    ],
    capabilities: [],
  },
  
  execute: async (args: Record<string, unknown>, ctx: PluginContext): Promise<ToolResult> => {
    const start = Date.now();
    try {
      // Input validation
      const name = args.name;
      if (!name || typeof name !== 'string') {
        return {
          toolName: 'hello',
          success: false,
          output: '',
          error: 'Name must be a non-empty string',
          durationMs: Date.now() - start,
        };
      }

      // Execute tool
      const result = `Hello, ${name}! Welcome to Cortex.`;
      
      return {
        toolName: 'hello',
        success: true,
        output: result,
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'hello',
        success: false,
        output: '',
        error: `Failed to greet: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  }
};

/**
 * Addition tool - Add two numbers
 */
const addTool: Tool = {
  definition: {
    name: 'add',
    description: 'Add two numbers together',
    params: [
      {
        name: 'a',
        type: 'number',
        description: 'First number',
        required: true,
      },
      {
        name: 'b',
        type: 'number',
        description: 'Second number',
        required: true,
      }
    ],
    capabilities: [],
  },
  
  execute: async (args: Record<string, unknown>, ctx: PluginContext): Promise<ToolResult> => {
    const start = Date.now();
    try {
      // Input validation
      const a = args.a;
      const b = args.b;
      if (typeof a !== 'number' || typeof b !== 'number') {
        return {
          toolName: 'add',
          success: false,
          output: '',
          error: 'Both parameters must be numbers',
          durationMs: Date.now() - start,
        };
      }

      // Execute tool
      const result = a + b;
      
      return {
        toolName: 'add',
        success: true,
        output: String(result),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'add',
        success: false,
        output: '',
        error: `Failed to add: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  }
};

/**
 * Data fetching tool - Fetch from external API
 */
const fetchDataTool: Tool = {
  definition: {
    name: 'fetch_data',
    description: 'Fetch data from an external API',
    params: [
      {
        name: 'url',
        type: 'string',
        description: 'URL to fetch from (HTTPS only)',
        required: true,
      }
    ],
    capabilities: ['network:fetch'],
  },
  
  execute: async (args: Record<string, unknown>, ctx: PluginContext): Promise<ToolResult> => {
    const start = Date.now();
    try {
      // Input validation
      const url = args.url;
      if (!url || typeof url !== 'string') {
        return {
          toolName: 'fetch_data',
          success: false,
          output: '',
          error: 'URL must be a non-empty string',
          durationMs: Date.now() - start,
        };
      }

      if (!url.startsWith('https://')) {
        return {
          toolName: 'fetch_data',
          success: false,
          output: '',
          error: 'Only HTTPS URLs are allowed for security',
          durationMs: Date.now() - start,
        };
      }

      // Fetch data with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'CortexPrism-ExamplePlugin/1.0.0',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          return {
            toolName: 'fetch_data',
            success: false,
            output: '',
            error: `HTTP ${response.status}: ${response.statusText}`,
            durationMs: Date.now() - start,
          };
        }

        const data = await response.text();
        
        return {
          toolName: 'fetch_data',
          success: true,
          output: data,
          durationMs: Date.now() - start,
        };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          return {
            toolName: 'fetch_data',
            success: false,
            output: '',
            error: 'Request timeout (5 seconds)',
            durationMs: Date.now() - start,
          };
        }
        throw error;
      }
    } catch (error) {
      return {
        toolName: 'fetch_data',
        success: false,
        output: '',
        error: `Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  }
};

/**
 * Lifecycle hook - called when plugin loads
 */
export async function onLoad(ctx: PluginContext): Promise<void> {
  ctx.logger.info(`[example-plugin] Loaded in ${ctx.pluginDir}`);
}

/**
 * Lifecycle hook - called when plugin unloads
 */
export async function onUnload(ctx: PluginContext): Promise<void> {
  ctx.logger.info('[example-plugin] Unloading...');
}

/**
 * Exported tools - the plugin loader picks these up by name
 */
export const tools: Tool[] = [
  helloTool,
  addTool,
  fetchDataTool,
];
