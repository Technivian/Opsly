import { vi } from 'vitest';

/**
 * Mock Gmail API client
 */
export const mockGmailClient = {
  users: {
    messages: {
      list: vi.fn().mockResolvedValue({
        data: {
          messages: [
            { id: 'msg-001', threadId: 'thread-001' },
            { id: 'msg-002', threadId: 'thread-002' },
            { id: 'msg-003', threadId: 'thread-003' },
          ],
        },
      }),
      get: vi.fn().mockImplementation(({ id }: { id: string }) => ({
        data: {
          id,
          threadId: `thread-${id}`,
          payload: {
            headers: [
              { name: 'Subject', value: `Test Email ${id}` },
              { name: 'From', value: 'sender@example.com' },
              { name: 'To', value: 'receiver@example.com' },
              { name: 'Date', value: new Date().toISOString() },
            ],
            body: {
              data: Buffer.from(`This is test email body for ${id}`).toString('base64'),
            },
          },
          labelIds: ['INBOX', 'UNREAD'],
        },
      })),
      modify: vi.fn().mockResolvedValue({ data: {} }),
    },
  },
};

/**
 * Mock OpenAI client
 */
export const mockOpenAIClient = {
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue({
        id: 'chatcmpl-test',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4-1106-preview',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify({
                processSteps: [
                  {
                    step: 1,
                    description: 'Customer submits request via form',
                    duration: 5,
                  },
                  {
                    step: 2,
                    description: 'Request is manually reviewed',
                    duration: 30,
                  },
                  {
                    step: 3,
                    description: 'Response is prepared and sent',
                    duration: 15,
                  },
                ],
                bottlenecks: [
                  {
                    area: 'Manual Review',
                    impact: 'High',
                    suggestion: 'Implement automated triage using AI',
                  },
                ],
                backlog: [
                  {
                    priority: 1,
                    title: 'Automate email triage',
                    description: 'Use AI to categorize incoming emails',
                    estimatedImpact: '50% time reduction',
                  },
                ],
              }),
            },
            finish_reason: 'stop',
          },
        ],
      }),
    },
  },
};

/**
 * Mock Slack client
 */
export const mockSlackClient = {
  chat: {
    postMessage: vi.fn().mockResolvedValue({
      ok: true,
      channel: 'C1234567890',
      ts: '1234567890.123456',
      message: {
        text: 'Test message',
        username: 'bot',
        type: 'message',
      },
    }),
  },
};

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  vi.clearAllMocks();
}
