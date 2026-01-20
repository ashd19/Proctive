import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Brush, Send, Sparkles, User, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface FAQMap {
  [key: string]: string;
}

class VitalChainAI {
  basePrompt: string;
  conversationHistory: { role: string; content: string }[];

  constructor() {
    this.basePrompt = `You are VitalChain Guide, an assistant for a medical records + insurance claims dApp with patient, doctor, and insurance roles.

What the app does (summarize clearly):
- Patients: connect MetaMask, register, upload/share records, submit insurance claims, track claim statuses.
- Doctors: request emergency access, view granted records, log actions for audit.
- Insurance: review and process claims, statuses include Draft → Submitted → Under Review → Approved/Rejected/Settled.

How to help (prioritize clarity, bullet points, short sections):
- Explain medical/insurance terms in plain language.
- Give step-by-step instructions: connect MetaMask, switch accounts, pick Localhost 8545/Sepolia, submit claims, upload PDFs/images, link medical records.
- Summarize smart contract flow at a high level (VitalChainCore, PatientRecords, InsuranceClaims).
- If user asks about errors, offer quick fixes (network, account, approvals, record linking).
- Keep answers concise, structured, and formatted with headings + bullets.
- If unsure, ask for the exact error message or screen they see.
`;
    this.conversationHistory = [];
  }

  getFAQ(userMessage: string): string | null {
    const msg = userMessage.toLowerCase();
    const faq: FAQMap = {
      "connect|metamask|wallet|account|network|localhost|sepolia":
        "**Connect Wallet (MetaMask)**\n- Open MetaMask, pick network Localhost 8545 (chain 31337) or Sepolia.\n- Click Connect in the dApp. If wrong account shows, disconnect site in MetaMask → Connected sites → remove → reconnect and pick the right account.",
      "upload|record|pdf|image|medical|ipfs":
        "**Upload Medical Record**\n- Go to Patient → Upload PDF/Image.\n- Choose file, add title/description, submit.\n- Link the uploaded record when filing a claim.",
      "claim|insurance|submit|status|draft|under review|approved|rejected":
        "**Submit Insurance Claim**\n- Go to Patient → Insurance Claims → New Claim.\n- Select insurance provider, claim type, policy number, amount, date of service.\n- Link at least one medical record.\n- Submit → status moves from Draft to Submitted → Under Review → Approved/Rejected/Settled.",
      "doctor|emergency|access":
        "**Doctor Emergency Access**\n- Doctor requests emergency access. Patient/hospital can approve. Actions are logged to Audit Log.",
    };

    for (const [keywords, answer] of Object.entries(faq)) {
      const parts = keywords.split("|");
      if (parts.some((k) => msg.includes(k))) return answer;
    }
    return null;
  }

  async askGemini(userMessage: string): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey)
      throw new Error("Gemini API key not set (VITE_GEMINI_API_KEY)");

    const historyText = this.conversationHistory
      .map((h) => `${h.role}: ${h.content}`)
      .join("\n");

    const prompt = `${this.basePrompt}\n\nConversation so far:\n${historyText}\nUser: ${userMessage}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 512,
          },
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${text}`);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't get a response right now. Please try again.";

    this.conversationHistory.push({ role: "user", content: userMessage });
    this.conversationHistory.push({ role: "assistant", content: text });
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    return text;
  }

  async getResponse(userMessage: string): Promise<string> {
    const faq = this.getFAQ(userMessage);
    if (faq) return faq;
    return this.askGemini(userMessage);
  }
}

export default function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 1,
      text: "Hi! I'm the VitalChain assistant. I can explain medical terms, guide MetaMask setup, walk you through uploads and claims, and summarize how this dApp works. What do you need?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = useMemo(() => new VitalChainAI(), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const current = input;
    setInput("");
    setIsTyping(true);

    try {
      const reply = await aiService.getResponse(current);
      const botMessage: Message = {
        id: userMessage.id + 1,
        text: reply,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to get AI response");
      const botMessage: Message = {
        id: userMessage.id + 1,
        text: "I couldn't reach the AI right now. Please verify VITE_GEMINI_API_KEY is set and try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen && (
        <div className="mb-3 w-[28rem] h-[34rem] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold">VitalChain Assistant</p>
                <p className="text-xs text-white/80">
                  Help with MetaMask, uploads, claims
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 max-w-xs ${
                    m.sender === "user" ? "flex-row-reverse gap-2" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                      m.sender === "user"
                        ? "bg-sky-600 text-white"
                        : "bg-emerald-200 text-emerald-900"
                    }`}
                  >
                    {m.sender === "user" ? (
                      <User size={14} />
                    ) : (
                      <Brush size={14} />
                    )}
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm whitespace-pre-wrap leading-relaxed ${
                      m.sender === "user"
                        ? "bg-sky-600 text-white rounded-br-sm shadow"
                        : "bg-white text-slate-800 rounded-bl-sm shadow border border-slate-100"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 max-w-xs">
                  <div className="w-7 h-7 bg-emerald-200 rounded-full flex items-center justify-center text-xs text-emerald-900">
                    <Brush size={14} />
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg rounded-bl-sm shadow border border-slate-100">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                      <div
                        className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 p-3 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about MetaMask, uploads, claims..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-9 h-9 bg-sky-600 text-white rounded-full flex items-center justify-center hover:bg-sky-700 transition disabled:bg-slate-300"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 border-2 border-slate-100"
        }`}
        aria-label="Toggle assistant"
      >
        {isOpen ? <X size={28} /> : <Bot size={32} />}
      </button>
    </div>
  );
}
