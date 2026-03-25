/**
 * Prompt Registry (auto-discovery)
 *
 * Automatically finds and loads every prompt config in the configs/ folder.
 * To add a new prompt, just create a new .js file in configs/ — nothing else needed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configsDir = path.join(__dirname, 'configs');

// ── Load all configs on first use (lazy singleton) ─────────────────────
let _configs = null;

function loadConfigs() {
  if (_configs) return _configs;

  _configs = {};

  const files = fs.readdirSync(configsDir).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    const name = path.basename(file, '.js');
    _configs[name] = null; // placeholder — lazy-loaded via getPrompt()
  }

  return _configs;
}

/**
 * Get a prompt config by name.
 *
 * @param {string} name  The config file name without extension (e.g., 'extraction')
 * @returns {Promise<object>}  The prompt config object
 */
export async function getPrompt(name) {
  const configs = loadConfigs();

  if (!(name in configs)) {
    const available = Object.keys(configs).join(', ');
    throw new Error(
      `Prompt "${name}" not found. Available prompts: ${available}\n` +
      `To add it, create lib/prompts/configs/${name}.js`
    );
  }

  // Lazy-load the actual config on first access
  if (!configs[name]) {
    const mod = await import(`./configs/${name}.js`);
    configs[name] = mod.default;
  }

  return configs[name];
}

/**
 * List all available prompt names.
 *
 * @returns {string[]}
 */
export function listPrompts() {
  return Object.keys(loadConfigs());
}

/**
 * List all prompts with metadata (name + description).
 * Used by the /api/prompts endpoint to populate the frontend dropdown.
 *
 * @returns {Promise<Array<{ name: string, description: string }>>}
 */
export async function listPromptsWithMeta() {
  const names = listPrompts();
  const results = [];

  for (const name of names) {
    const config = await getPrompt(name);
    results.push({ name: config.name, description: config.description });
  }

  return results;
}
