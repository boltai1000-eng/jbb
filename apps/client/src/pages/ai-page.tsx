import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bot, SendHorizontal, Sparkles, TrendingUp } from "lucide-react";
import { api } from "../lib/api";
import { useFilters } from "../components/filters-context";

export function AiPage() {
  const { filters } = useFilters();
  const [question, setQuestion] = useState("Which city gave highest revenue last month?");
  const insightsQuery = useQuery({
    queryKey: ["insights", filters],
    queryFn: () => api.insights(filters),
  });
  const chatMutation = useMutation({
    mutationFn: () => api.chat({ question, filters }),
  });

  const data = insightsQuery.data;

  return (
    <div className="page-stack">
      <section className="two-column-grid">
        <div className="card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Automatic insights</p>
              <h3>AI summary of current filtered data</h3>
            </div>
          </div>
          <div className="insight-grid">
            <InsightBlock
              title="Sales trends"
              icon={TrendingUp}
              items={data?.insights || ["Loading insights..."]}
            />
            <InsightBlock
              title="Predictions"
              icon={Sparkles}
              items={data?.predictions || ["Preparing forecast analysis..."]}
            />
            <InsightBlock
              title="Suggestions"
              icon={Bot}
              items={data?.suggestions || ["Generating practical business suggestions..."]}
            />
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Chat</p>
              <h3>Ask questions about stored sales data</h3>
            </div>
          </div>

          <div className="chat-box">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about revenue, sellers, weak areas, or demand patterns"
            />
            <button className="primary-button" onClick={() => chatMutation.mutate()}>
              <SendHorizontal size={16} />
              Ask Gemini
            </button>
          </div>

          <div className="response-panel">
            {chatMutation.isPending ? "Thinking..." : chatMutation.data?.answer || "Ask a question to get an answer grounded in your filtered records."}
          </div>
        </div>
      </section>
    </div>
  );
}

function InsightBlock({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <section className="insight-block">
      <div className="insight-header">
        <Icon size={18} />
        <h4>{title}</h4>
      </div>
      <div className="insight-list">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}
