import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx("div", { className: "page-stack", children: _jsxs("section", { className: "two-column-grid", children: [_jsxs("div", { className: "card", children: [_jsx("div", { className: "section-title", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Automatic insights" }), _jsx("h3", { children: "AI summary of current filtered data" })] }) }), _jsxs("div", { className: "insight-grid", children: [_jsx(InsightBlock, { title: "Sales trends", icon: TrendingUp, items: data?.insights || ["Loading insights..."] }), _jsx(InsightBlock, { title: "Predictions", icon: Sparkles, items: data?.predictions || ["Preparing forecast analysis..."] }), _jsx(InsightBlock, { title: "Suggestions", icon: Bot, items: data?.suggestions || ["Generating practical business suggestions..."] })] })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "section-title", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Chat" }), _jsx("h3", { children: "Ask questions about stored sales data" })] }) }), _jsxs("div", { className: "chat-box", children: [_jsx("textarea", { value: question, onChange: (event) => setQuestion(event.target.value), placeholder: "Ask about revenue, sellers, weak areas, or demand patterns" }), _jsxs("button", { className: "primary-button", onClick: () => chatMutation.mutate(), children: [_jsx(SendHorizontal, { size: 16 }), "Ask Gemini"] })] }), _jsx("div", { className: "response-panel", children: chatMutation.isPending ? "Thinking..." : chatMutation.data?.answer || "Ask a question to get an answer grounded in your filtered records." })] })] }) }));
}
function InsightBlock({ title, items, icon: Icon, }) {
    return (_jsxs("section", { className: "insight-block", children: [_jsxs("div", { className: "insight-header", children: [_jsx(Icon, { size: 18 }), _jsx("h4", { children: title })] }), _jsx("div", { className: "insight-list", children: items.map((item) => (_jsx("p", { children: item }, item))) })] }));
}
