// Run this script once after setting up MongoDB Atlas to create the vector search index.
// Usage: node lib/db/indexes.js
// NOTE: The vector search index must be created via Atlas UI or Atlas Admin API.
// This script prints the index definition to copy into Atlas UI.

import { connectDB } from './connection.js';
import { DocumentModel } from './models/Document.js';

export const VECTOR_INDEX_DEFINITION = {
  name: 'vector_search_index',
  type: 'vectorSearch',
  definition: {
    fields: [
      {
        type: 'vector',
        path: 'embedding',
        numDimensions: 768,
        similarity: 'cosine',
      },
      { type: 'filter', path: 'status' },
      { type: 'filter', path: 'createdAt' },
    ],
  },
};

async function setupIndexes() {
  await connectDB();

  console.log('\n=== Mongoose text indexes created automatically by schema ===\n');

  console.log('=== Atlas Vector Search Index Definition ===');
  console.log('Copy the JSON below and create it in your Atlas UI:');
  console.log('  Database → Search → Create Search Index → JSON Editor\n');
  console.log(JSON.stringify(VECTOR_INDEX_DEFINITION, null, 2));

  console.log('\nDone. Indexes set up successfully.');
  process.exit(0);
}

setupIndexes().catch((err) => {
  console.error('Index setup failed:', err);
  process.exit(1);
});
