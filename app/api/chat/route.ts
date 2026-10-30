import { streamText, convertToModelMessages, type UIMessage, toUIMessageStream, createUIMessageStreamResponse } from 'ai';
import * as dotenv from 'dotenv'
import { z } from 'zod'
export const maxDuration = 30;

dotenv.config()

export async function POST(request: Request) {
    const { messages } = (await request.json()) satisfies { messages: UIMessage[]};

    const result = streamText({
        model: "openai/gpt-4.1",
        system: "You are an helpful assistant. Use tools when they help answer the user's question",
        messages: await convertToModelMessages(messages),
        tools: {
            getTime: {
                description: "Get the current time",
                inputSchema: z.object({
                    locale: z.string().describe("Optional BCP 47 locale like en-US; defaults to environment").optional(),
                    timezone: z.string().describe("Optional IANA timezone like America/New_York; defaults to system").optional()
                }),
                execute: async ({locale, timeZone}) => {
                    try {
                        const now = new Date();
                        const text = now.toLocaleDateString(locale, {
                            timeZone,
                            hour: "numeric",
                            minute: "2-digit",
                            second: "2-digit",
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "2-digit"
                        });
                        return { now: now.toISOString(), formatted: text, timeZone }
                    } catch {
                        return { error: "Invalid locale or timezone"}
                    }
                },
            }
        }
    });

    return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
    }); 
}