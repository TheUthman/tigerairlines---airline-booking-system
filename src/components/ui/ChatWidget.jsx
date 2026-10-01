import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "m1",
      sender: "bot",
      text: "Welcome to TigerAirlines Nigeria Concierge! How can I assist your flight booking or travel plans today?",
      time: "Just now"
    }
  ]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);
  const handleSend = (userText) => {
    if (!userText.trim()) return;
    const userMsg = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: userText,
      time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      let replyText = "I'm glad to help! You can check live schedules on our Flight Status page or manage bookings using your 6-character PNR.";
      const lower = userText.toLowerCase();
      if (lower.includes("status") || lower.includes("flight") || lower.includes("track")) {
        replyText = "You can view live status and airspace tracking for all today's flights on our Flight Status tracker.";
      } else if (lower.includes("bag") || lower.includes("luggage")) {
        replyText = "Economy passengers enjoy 23 kg checked luggage + 7 kg cabin baggage on domestic routes. Extra baggage can be added under Manage Booking.";
      } else if (lower.includes("check") || lower.includes("pass") || lower.includes("boarding")) {
        replyText = "Online check-in opens 24 hours before flight departure. You can check in right now under the Check-In menu.";
      } else if (lower.includes("cancel") || lower.includes("refund")) {
        replyText = "Cancellations can be processed through Manage Booking. Fares are refunded after a standard \u20A615,000 airline handling fee.";
      } else if (lower.includes("human") || lower.includes("agent") || lower.includes("call")) {
        replyText = "Our Lagos 24/7 hotline is +234 1 279 0000, or reach our concierge team via our Contact page.";
      }
      setMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: replyText,
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 700);
  };
  return <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {
    /* Floating Button */
  }
      {!isOpen && <button
    type="button"
    onClick={() => setIsOpen(true)}
    className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20 group"
    aria-label="Open TigerAirlines Support Chat"
  >
          <div className="relative">
            <MessageSquare size={18} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-primary" />
          </div>
          <span className="text-xs font-bold tracking-tight">Need help?</span>
        </button>}

      {
    /* Chat Popover Window */
  }
      {isOpen && <div className="w-[min(380px,calc(100vw-2rem))] bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col h-[min(490px,70vh)]">
          {
    /* Header */
  }
          <div className="bg-primary p-4 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                <Plane size={16} className="text-secondary transform -rotate-45" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">TigerBot Concierge</p>
                <p className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Operational Support
                </p>
              </div>
            </div>
            <button
    type="button"
    onClick={() => setIsOpen(false)}
    className="p-1 text-white/80 hover:text-white rounded-lg transition"
    aria-label="Close chat"
  >
              <X size={18} />
            </button>
          </div>

          {
    /* Quick Option Chips */
  }
          <div className="p-2.5 bg-background border-b border-border flex flex-wrap gap-1.5 text-[11px]">
            {[
    "Track Flight Status",
    "Baggage Limits",
    "Online Check-In",
    "Contact Support"
  ].map((chip) => <button
    key={chip}
    type="button"
    onClick={() => handleSend(chip)}
    className="px-2.5 py-1 bg-surface hover:bg-primary/10 hover:text-primary border border-border rounded-full font-medium text-foreground transition cursor-pointer"
  >
                {chip}
              </button>)}
          </div>

          {
    /* Messages Body */
  }
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background/50 text-xs">
            {messages.map((m) => <div
    key={m.id}
    className={`flex items-start gap-2 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
  >
                <div
    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${m.sender === "user" ? "bg-foreground text-background" : "bg-primary text-on-primary"}`}
  >
                  {m.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                </div>

                <div
    className={`max-w-[78%] rounded-2xl p-3 leading-relaxed shadow-2xs ${m.sender === "user" ? "bg-foreground text-background rounded-tr-none" : "bg-surface text-foreground border border-border rounded-tl-none"}`}
  >
                  <p>{m.text}</p>
                  <span
    className={`block text-[9px] mt-1 ${m.sender === "user" ? "text-muted text-right" : "text-muted"}`}
  >
                    {m.time}
                  </span>
                </div>
              </div>)}

            {typing && <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Bot size={12} />
                </div>
                <div className="bg-surface border border-border p-2.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>}
            <div ref={messagesEndRef} />
          </div>

          {
    /* Input Box */
  }
          <div className="p-3 bg-surface border-t border-border flex items-center gap-2">
            <input
    type="text"
    placeholder="Ask a question..."
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleSend(input);
    }}
    className="flex-1 bg-surface-muted rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
  />
            <button
    type="button"
    onClick={() => handleSend(input)}
    className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition cursor-pointer shrink-0"
    aria-label="Send message"
  >
              <Send size={13} />
            </button>
          </div>
        </div>}
    </div>;
};
var stdin_default = ChatWidget;
export {
  ChatWidget,
  stdin_default as default
};
