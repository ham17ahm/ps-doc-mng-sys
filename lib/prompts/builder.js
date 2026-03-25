/**
 * Prompt Builder
 *
 * Takes a prompt config object and assembles it into the final prompt string
 * that gets sent to Gemini. You should NOT need to edit this file — edit the
 * config files in configs/ instead.
 */

import { defaultSchema } from './schema.js';

/**
 * Build a prompt string from a config object.
 *
 * If the config has its own schema, that is used.
 * Otherwise the shared default schema from schema.js is used.
 *
 * @param {object} config  A prompt config (see configs/extraction.js for shape)
 * @returns {string}       The assembled prompt ready to send to Gemini
 */
export function buildPrompt(config) {
  const schema = config.schema || defaultSchema;

  const numberedRules = config.rules
    .map((rule, i) => `${i + 1}. ${rule}`)
    .join('\n');

  return [
    config.role,
    '',
    `Your task is to ${config.task}`,
    '',
    'RULES:',
    numberedRules,
    '',
    'EXTRACTION SCHEMA:',
    JSON.stringify(schema, null, 2),
    '',
    config.closing,
  ].join('\n');
}
