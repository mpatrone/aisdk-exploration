"use client";

import {
  PaperclipIcon,
  ArrowUpIcon,
  ImageIcon,
  GlobeIcon,
  MicIcon,
  ChevronDownIcon,
  PlusIcon,
} from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  Tool,
} from "@/components/ai-elements/tool";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"

import { useChat } from "@ai-sdk/react";
import { isToolUIPart } from "ai";
import Image from "next/image";
import React, { useState } from "react";

const providers = [
  {
    name: "OpenAI",
    models: [
      { id: "gpt-5", name: "GPT-5" },
      { id: "gpt-5-mini", name: "GPT-5 mini" },
    ],
  },
  {
    name: "Anthropic",
    models: [
      { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5" },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5" },
    ],
  },
];

const models = providers.flatMap((provider) => provider.models);

const efforts = [
  { id: "low", name: "Low" },
  { id: "medium", name: "Medium" },
  { id: "high", name: "High" },
];

export default function Home() {
  const { messages, sendMessage, status } = useChat();
  const [model, setModel] = useState(models[0].id);
  const [effort, setEffort] = useState(efforts[1].id);
  const currentModel = models.find((item) => item.id === model) ?? models[0];
  const currentEffort =
    efforts.find((item) => item.id === effort) ?? efforts[1];

  return (
    <div className="font-mono min-h-[80vh] flex flex-col p-6 items-center">
      <main className="w-full max-w-2xl flex flex-col gap-4 flex-1">
        <h1 className="text-xl font-semibold">Chat</h1>

        <Conversation className="rounded-lg border bg-white dark:bg-black/20">
          {messages.length === 0 ? (
            <ConversationEmptyState description="say hi to start the chat" />
          ) : null}

          <ConversationContent>
            {messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  <MessageResponse>
                    {m.parts
                      ?.filter((p) => p.type === "text")
                      .map((p) => (p.type === "text" ? p.text : ""))
                      .join("\n")}
                  </MessageResponse>
                  {m.parts?.map((p, i) => {
                    if (isToolUIPart(p)) {
                      return (
                        <Tool key={`${m.id}-tool-${i}`}>
                          {p.type === "dynamic-tool" ? (
                            <ToolHeader
                              type={p.type}
                              state={p.state}
                              toolName={p.toolName}
                            />
                          ) : (
                            <ToolHeader type={p.type} state={p.state} />
                          )}
                          <ToolContent>
                            <ToolInput input={p.input} />
                            <ToolOutput
                              output={(p as any).output}
                              errorText={(p as any).errorText}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>

        <PromptInput
          onSubmit={(message, e) => {
            e.preventDefault();
            const text = message.text ?? "";
            if (!text && !(message.files && message.files.length)) return;
            void sendMessage({ text, files: message.files  });
            e.currentTarget.reset();
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea placeholder="Type your message..." />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputButton aria-label="Add attachment" disabled>
                <PaperclipIcon className="size-4" />
              </PromptInputButton>
              <PromptInputButton aria-label="Start voice input" disabled>
                <MicIcon className="size-4" />
                <span className="hidden sm:inline">Voice</span>
              </PromptInputButton>
              <PromptInputActionMenu >
              <PromptInputActionMenuTrigger />
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments  className="font-mono"/>
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <DropdownMenu>
                <DropdownMenuTrigger 
                  render={
                    <InputGroupButton
                      size="sm"
                      variant="outline"
                      aria-label={`Model: ${currentModel.name}`}
                      className="ml-auto"
                    >
                      {currentModel.name}
                      <ChevronDownIcon />
                    </InputGroupButton>
                  }
                />
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuRadioGroup
                    value={model}
                    onValueChange={setModel}
                  >
                    {providers.map((provider, index) => (
                      <React.Fragment key={provider.name}>
                        {index > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuGroup  className="font-mono">
                          <DropdownMenuLabel>{provider.name}</DropdownMenuLabel>
                          {provider.models.map((item) => (
                            <DropdownMenuRadioItem
                              key={item.id}
                              value={item.id}
                              closeOnClick
                            >
                              {item.name}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuGroup>
                      </React.Fragment>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <InputGroupButton
                      size="sm"
                      variant="outline"
                      aria-label={`Effort: ${currentEffort.name}`}
                    >
                      <span className="text-muted-foreground">Effort</span>
                      {currentEffort.name}
                      <ChevronDownIcon />
                    </InputGroupButton>
                  }
                />
                <DropdownMenuContent align="start" className="w-36">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Effort</DropdownMenuLabel>
                    <DropdownMenuRadioGroup  className="font-mono"
                      value={effort}
                      onValueChange={setEffort}
                    >
                      {efforts.map((item) => (
                        <DropdownMenuRadioItem
                          key={item.id}
                          value={item.id}
                          closeOnClick
                        >
                          {item.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </main>
    </div>
  );
}
