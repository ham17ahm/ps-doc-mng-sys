import { getDocumentStatus } from '@/lib/services/document.service';
import { extractionQueue } from '@/lib/queue/processor';

const TERMINAL_STATUSES = ['extracted', 'completed', 'failed'];

export async function GET(request, { params }) {
  const { id } = params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(
          encoder.encode(`event: status\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      // If the job already finished before the client connected, send the
      // current state immediately and close (no need to keep the stream open).
      try {
        const current = await getDocumentStatus(id);

        if (TERMINAL_STATUSES.includes(current.status)) {
          const payload = {
            status:          current.status,
            referenceNumber: current.referenceNumber,
            error:           current.errorMessage,
          };

          // For 'extracted', include the reviewable fields so the client
          // can still populate the edit form after a reconnect.
          if (current.status === 'extracted' && current.extractedData) {
            const { rawText, ...reviewable } = current.extractedData;
            payload.extractedData = reviewable;
          }

          send(payload);
          controller.close();
          return;
        }
      } catch {
        send({ status: 'failed', error: 'Document not found' });
        controller.close();
        return;
      }

      // Live updates — register on the in-process queue
      extractionQueue.onStatus(id, (payload) => {
        send(payload);
        // Close the stream once we reach a terminal state
        if (TERMINAL_STATUSES.includes(payload.status)) {
          extractionQueue.offStatus(id);
          controller.close();
        }
      });

      request.signal.addEventListener('abort', () => {
        extractionQueue.offStatus(id);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  });
}
