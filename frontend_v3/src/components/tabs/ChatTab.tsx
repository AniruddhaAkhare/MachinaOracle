"use client";
import { useState, useRef, useEffect } from "react";
import { sendChat } from "@/lib/api";

interface Props { sessionId: string; machineId: string; machineName: string; }
interface Msg { role: "user" | "assistant"; content: string; }

const SUGGESTED = [
  "What is the current health status?",
  "When should I schedule maintenance?",
  "What are the main failure risks?",
  "What spare parts should I stock?",
  "How can I extend machine lifespan?",
];

export default function ChatTab({ sessionId, machineId, machineName }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: "assistant",
    content: `MachinaOracle AI ready — I have full context on **${machineName}**, including sensor data, log history, and 5,000 similar machine records. Ask me anything about this machine.`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (msg: string) => {
    if (!msg.trim() || loading) return;
    setMsgs(prev => [...prev, { role: "user", content: msg }]);
    setInput(""); setLoading(true);
    try {
      const { data } = await sendChat(sessionId, machineId, msg, msgs);
      setMsgs(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMsgs(prev => [...prev, { role: "assistant", content: "Connection error — verify backend is running." }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 180px)" }}>
      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", display:"flex", flexDirection:"column", gap:18 }}>
        {msgs.map((msg, i) => (
          <div key={i} style={{ display:"flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "user" ? (
              <div className="chat-user" style={{ maxWidth:"72%" }}>
                <p style={{ fontSize:15, color:"var(--t1)", lineHeight:1.65 }}>{msg.content}</p>
              </div>
            ) : (
              <div className="chat-ai" style={{ maxWidth:"80%" }}>
                <p style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--blue-light)", marginBottom:8, letterSpacing:"0.13em" }}>
                  ORACLE AI
                </p>
                <p style={{ fontSize:15, color:"var(--t2)", lineHeight:1.75, whiteSpace:"pre-wrap" }}>{msg.content}</p>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-ai">
            <p style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--blue-light)", marginBottom:10, letterSpacing:"0.13em" }}>ORACLE AI</p>
            <div style={{ display:"flex", gap:5 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"var(--blue)", opacity:0.5,
                  animation:"bounce 1.2s ease infinite", animationDelay:`${i*0.18}s` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {msgs.length <= 2 && (
        <div style={{ padding:"0 28px 12px", display:"flex", flexWrap:"wrap", gap:7 }}>
          {SUGGESTED.map((s, i) => (
            <button key={i} onClick={() => send(s)} className="btn btn-secondary" style={{ fontSize:13, padding:"7px 13px" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:"14px 28px", borderTop:"1px solid var(--bd-1)", display:"flex", gap:10 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder={`Query ${machineName}...`}
          className="field" style={{ flex:1 }}/>
        <button onClick={() => send(input)} disabled={loading || !input.trim()} className="btn btn-primary">
          Send
        </button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}
