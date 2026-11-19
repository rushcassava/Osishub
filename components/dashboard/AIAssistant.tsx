"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  X,
  RefreshCw,
  Send,
  Zap,
  Sparkles,
  Loader2,
  AlertCircle,
  Move,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Position = {
  x: number;
  y: number;
};

const quickPrompts = [
  "Apa saja agenda OSIS bulan ini?",
  "Bagaimana alur pengajuan LPJ kegiatan?",
  "Cara melakukan absensi QR pada event?",
];

const STORAGE_KEY = "osis-hub-ai-position";
const BUBBLE_SIZE = 54;
const EDGE_GAP = 12;

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [position, setPosition] = useState<Position | null>(null);
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);

  const dragRef = useRef({
    active: false,
    moved: false,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
  });

  const suppressClickRef = useRef(false);

  // Mengatur posisi awal dan mengambil posisi tersimpan
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({ width, height });

      setPosition((current) => {
        if (!current) {
          let saved: Position | null = null;

          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) saved = JSON.parse(stored);
          } catch {
            saved = null;
          }

          return {
            x: Math.max(
              EDGE_GAP,
              Math.min(
                saved?.x ?? width - BUBBLE_SIZE - EDGE_GAP,
                width - BUBBLE_SIZE - EDGE_GAP
              )
            ),
            y: Math.max(
              EDGE_GAP,
              Math.min(
                saved?.y ?? height - BUBBLE_SIZE - 110,
                height - BUBBLE_SIZE - EDGE_GAP
              )
            ),
          };
        }

        return {
          x: Math.max(
            EDGE_GAP,
            Math.min(current.x, width - BUBBLE_SIZE - EDGE_GAP)
          ),
          y: Math.max(
            EDGE_GAP,
            Math.min(current.y, height - BUBBLE_SIZE - EDGE_GAP)
          ),
        };
      });
    };

    updateViewport();

    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  // Menyimpan posisi bubble
  useEffect(() => {
    if (!position) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    } catch {
      // Penyimpanan lokal tidak tersedia
    }
  }, [position]);

  // Auto-scroll percakapan
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Mengatur drag bubble
  function handlePointerDown(
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!position) return;

    event.preventDefault();
    bubbleRef.current?.setPointerCapture(event.pointerId);

    dragRef.current = {
      active: true,
      moved: false,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
      startX: event.clientX,
      startY: event.clientY,
    };

    suppressClickRef.current = false;
    setIsDragging(true);
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!dragRef.current.active || !viewport.width) return;

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;

    if (
      Math.abs(deltaX) > 5 ||
      Math.abs(deltaY) > 5
    ) {
      dragRef.current.moved = true;
    }

    if (!dragRef.current.moved) return;

    const x = Math.max(
      EDGE_GAP,
      Math.min(
        event.clientX - dragRef.current.offsetX,
        viewport.width - BUBBLE_SIZE - EDGE_GAP
      )
    );

    const y = Math.max(
      EDGE_GAP,
      Math.min(
        event.clientY - dragRef.current.offsetY,
        viewport.height - BUBBLE_SIZE - EDGE_GAP
      )
    );

    setPosition({ x, y });
  }

  function handlePointerUp(
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!dragRef.current.active) return;

    dragRef.current.active = false;

    try {
      if (bubbleRef.current?.hasPointerCapture(event.pointerId)) {
        bubbleRef.current.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer capture sudah dilepaskan
    }

    if (dragRef.current.moved && position) {
      const middle = viewport.width / 2;

      const snappedX =
        position.x + BUBBLE_SIZE / 2 < middle
          ? EDGE_GAP
          : viewport.width - BUBBLE_SIZE - EDGE_GAP;

      setPosition({
        x: snappedX,
        y: Math.max(
          EDGE_GAP,
          Math.min(
            position.y,
            viewport.height - BUBBLE_SIZE - EDGE_GAP
          )
        ),
      });

      suppressClickRef.current = true;
    }

    setIsDragging(false);
  }

  async function sendMessage(text?: string) {
    const message = (text ?? input).trim();

    if (!message || isLoading) return;

    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
    ]);

    setIsLoading(true);

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal mendapatkan jawaban dari AI."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        errorMessage =
          "Waktu tunggu AI telah habis. Silakan coba kirim pertanyaan kembali.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }

  function resetChat() {
    if (isLoading) return;

    setMessages([]);
    setInput("");
  }

  // Menghitung posisi jendela chat agar tetap di dalam layar
  const panelWidth = Math.min(400, Math.max(0, viewport.width - 32));
  const panelHeight = Math.min(650, Math.max(0, viewport.height - 48));

  const panelLeft =
    position && viewport.width
      ? Math.max(
          16,
          Math.min(
            position.x + BUBBLE_SIZE / 2 > viewport.width / 2
              ? position.x + BUBBLE_SIZE - panelWidth
              : position.x,
            viewport.width - panelWidth - 16
          )
        )
      : 16;

  const panelTop =
    position && viewport.height
      ? Math.max(
          16,
          Math.min(
            position.y > viewport.height / 2
              ? position.y + BUBBLE_SIZE - panelHeight
              : position.y,
            viewport.height - panelHeight - 16
          )
        )
      : 16;

  return (
    <>
      {/* FLOATING BUBBLE */}
      {!isOpen && position && (
        <button
          ref={bubbleRef}
          type="button"
          aria-label="Buka Asisten OSIS-Hub"
          title="Asisten OSIS-Hub — geser untuk memindahkan"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={() => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              return;
            }

            setIsOpen(true);
          }}
          style={{
            left: position.x,
            top: position.y,
            touchAction: "none",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          className={`fixed z-[100] flex h-[54px] w-[54px] items-center justify-center rounded-full border-2 border-white bg-[#122A5C] text-white shadow-xl transition-shadow hover:shadow-2xl ${
            isDragging ? "scale-110 shadow-2xl" : ""
          }`}
        >
          <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse" />

          <Bot size={25} className="relative z-10" />

          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400" />

          <span className="sr-only">
            <Move size={12} />
          </span>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div
          style={{
            left: panelLeft,
            top: panelTop,
            width: panelWidth || "min(400px, calc(100vw - 32px))",
            height: panelHeight || "min(650px, calc(100dvh - 48px))",
          }}
          className="fixed z-[101] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white font-sans shadow-2xl"
        >
          {/* HEADER */}
          <div className="flex items-center gap-3 bg-[#122A5C] px-4 py-4 text-white">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Bot size={25} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold">
                Asisten OSIS-Hub
              </h3>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400" />

                <span className="text-[11px] text-blue-100">
                  Online
                </span>
              </div>

              <p className="mt-0.5 text-[10px] text-blue-200">
                Bantuan program kerja & info organisasi
              </p>
            </div>

            <button
              onClick={resetChat}
              disabled={isLoading}
              title="Mulai percakapan baru"
              className="rounded-lg p-2 transition hover:bg-white/10 disabled:opacity-40"
            >
              <RefreshCw size={17} />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              title="Minimalkan"
              className="rounded-lg p-2 transition hover:bg-white/10"
            >
              <X size={19} />
            </button>
          </div>

          {/* CHAT STREAM */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-[#F8F9FC] p-4">
            {messages.length === 0 && (
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E9EDFF] text-[#263F80]">
                  <Sparkles size={17} />
                </div>

                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-100 bg-white p-3 shadow-sm">
                  <span className="mb-2 inline-block rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                    AI ASSISTANT
                  </span>

                  <p className="text-sm font-semibold text-[#122A5C]">
                    Halo! Mau tanya apa nih? 👋
                  </p>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Aku siap membantu kamu seputar kegiatan OSIS,
                    program kerja, proposal, LPJ, dan administrasi organisasi.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E9EDFF] text-[#263F80]">
                    {message.content.toLowerCase().includes("waktu tunggu") ||
                    message.content.toLowerCase().includes("kesalahan") ? (
                      <AlertCircle size={17} />
                    ) : (
                      <Bot size={17} />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[85%] break-words rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "whitespace-pre-wrap rounded-tr-sm bg-[#122A5C] text-white"
                      : "rounded-tl-sm border border-slate-100 bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">
                            {children}
                          </p>
                        ),

                        strong: ({ children }) => (
                          <strong className="font-bold text-slate-900">
                            {children}
                          </strong>
                        ),

                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),

                        h1: ({ children }) => (
                          <h1 className="mb-2 mt-3 text-lg font-bold text-[#122A5C]">
                            {children}
                          </h1>
                        ),

                        h2: ({ children }) => (
                          <h2 className="mb-2 mt-3 text-base font-bold text-[#122A5C]">
                            {children}
                          </h2>
                        ),

                        h3: ({ children }) => (
                          <h3 className="mb-1 mt-2 text-sm font-bold text-[#122A5C]">
                            {children}
                          </h3>
                        ),

                        ul: ({ children }) => (
                          <ul className="mb-2 ml-5 list-disc space-y-1">
                            {children}
                          </ul>
                        ),

                        ol: ({ children }) => (
                          <ol className="mb-2 ml-5 list-decimal space-y-1">
                            {children}
                          </ol>
                        ),

                        li: ({ children }) => (
                          <li className="pl-1">{children}</li>
                        ),

                        blockquote: ({ children }) => (
                          <blockquote className="my-2 border-l-4 border-blue-300 pl-3 text-slate-600">
                            {children}
                          </blockquote>
                        ),

                        table: ({ children }) => (
                          <div className="my-3 overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                              {children}
                            </table>
                          </div>
                        ),

                        th: ({ children }) => (
                          <th className="border border-slate-200 bg-slate-100 px-2 py-2 font-bold">
                            {children}
                          </th>
                        ),

                        td: ({ children }) => (
                          <td className="border border-slate-200 px-2 py-2">
                            {children}
                          </td>
                        ),

                        pre: ({ children }) => (
                          <pre className="my-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                            {children}
                          </pre>
                        ),

                        code: ({ children, className }) => (
                          <code
                            className={`rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-blue-800 ${
                              className || ""
                            }`}
                          >
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9EDFF] text-[#263F80]">
                  <Bot size={17} />
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
                  <Loader2 size={15} className="animate-spin" />
                  AI sedang berpikir...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* QUICK PROMPTS */}
          {messages.length === 0 && (
            <div className="border-t border-slate-100 bg-white px-4 pt-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <Zap size={13} className="text-amber-500" />
                Rekomendasi Pertanyaan:
              </div>

              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isLoading}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-[10px] text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="border-t border-slate-100 bg-white p-3"
          >
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#F8F9FC] p-1.5 pl-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tulis pertanyaan..."
                disabled={isLoading}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#122A5C] text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>

            <p className="mt-2 text-center text-[9px] text-slate-400">
              OSIS-Hub Assistant • Asisten Resmi Organisasi
            </p>
          </form>
        </div>
      )}
    </>
  );
}