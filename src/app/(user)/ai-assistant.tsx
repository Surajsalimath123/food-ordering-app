// src/app/(user)/ai-assistant.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/providers/AuthProvider";

type TraceEntry = Record<string, any>;

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  traces?: TraceEntry[];
};

function getBackendUrl() {
  // Prefer env if you set it (recommended)
  // EXPO_PUBLIC_BACKEND_URL=http://localhost:8787
  const envUrl = (process.env.EXPO_PUBLIC_BACKEND_URL ?? "").trim();
  if (envUrl) return envUrl;

  // Fallbacks:
  // - iOS simulator: localhost works
  // - Android emulator: use 10.0.2.2
  // - Physical device: you MUST use your machine LAN IP (env recommended)
  if (Platform.OS === "android") return "http://10.0.2.2:8787";
  return "http://localhost:8787";
}

export default function AIAssistantScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const BACKEND_URL = useMemo(() => getBackendUrl(), []);

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello. How can I assist you today?",
    },
  ]);

  // Track which assistant messages have trace panels expanded
  const [expandedTraceIds, setExpandedTraceIds] = useState<Record<string, boolean>>({});

  const listRef = useRef<FlatList<ChatMsg>>(null);

  const canSend = useMemo(
    () => !!userId && inputText.trim().length > 0 && !loading,
    [userId, inputText, loading]
  );

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const toggleTraces = (msgId: string) => {
    setExpandedTraceIds((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const send = async () => {
    if (!canSend) return;

    const text = inputText.trim();
    setInputText("");

    const userMsg: ChatMsg = {
      id: String(Date.now()),
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    scrollToEnd();

    setLoading(true);
    try {
      // Send full conversation history for multi-turn behavior
      const payload = {
        userId,
        messages: nextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      const resp = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await resp.json().catch(() => null);

      const assistantText =
        json?.message ??
        json?.text ??
        json?.response ??
        (json?.error ? `Error: ${json.error}` : "Error: Unexpected response");

      const traces: TraceEntry[] = Array.isArray(json?.traces) ? json.traces : [];

      const botMsg: ChatMsg = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: String(assistantText),
        traces,
      };

      setMessages((prev) => [...prev, botMsg]);
      scrollToEnd();
    } catch (e: any) {
      const botMsg: ChatMsg = {
        id: String(Date.now() + 2),
        role: "assistant",
        content: `Network error: ${e?.message ?? "unknown"}`,
        traces: [],
      };
      setMessages((prev) => [...prev, botMsg]);
      scrollToEnd();
    } finally {
      setLoading(false);
    }
  };

  const renderTraces = (msg: ChatMsg) => {
    const traces = msg.traces ?? [];
    if (!traces.length) return null;

    const expanded = !!expandedTraceIds[msg.id];
    return (
      <View style={styles.traceWrap}>
        <TouchableOpacity onPress={() => toggleTraces(msg.id)} style={styles.traceHeader}>
          <Text style={styles.traceHeaderText}>
            Tool calls ({traces.length}) {expanded ? "▾" : "▸"}
          </Text>
        </TouchableOpacity>

        {expanded ? (
          <View style={styles.traceBody}>
            {traces.map((t, idx) => (
              <View key={`${msg.id}-trace-${idx}`} style={styles.traceCard}>
                <Text style={styles.traceTitle}>Call {idx + 1}</Text>
                <Text style={styles.traceJson}>{safePrettyJson(t)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {!userId ? (
        <View style={styles.center}>
          <Text style={styles.helper}>Please sign in to use the AI Assistant.</Text>
        </View>
      ) : (
        <>
          <FlatList
            ref={listRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <View style={{ width: "100%" }}>
                <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.botBubble]}>
                  <Text style={styles.bubbleText}>{item.content}</Text>
                </View>

                {item.role === "assistant" ? renderTraces(item) : null}
              </View>
            )}
            onContentSizeChange={scrollToEnd}
          />

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Ask for food..."
              value={inputText}
              onChangeText={setInputText}
              style={styles.input}
              editable={!loading}
              onSubmitEditing={send}
              returnKeyType="send"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
              onPress={send}
              disabled={!canSend}
            >
              {loading ? <ActivityIndicator /> : <Text style={styles.sendText}>Send</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.tip}>
            Try: "Suggestions", "I want something spicy under $15", "Add the first one", "Show my cart"
          </Text>

          <Text style={styles.backendHint}>Backend: {BACKEND_URL}</Text>
        </>
      )}
    </SafeAreaView>
  );
}

function safePrettyJson(value: any) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  helper: { fontSize: 16 },

  list: { flex: 1 },
  listContent: { padding: 12, gap: 10 },

  bubble: {
    maxWidth: "85%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#d7f7c2" },
  botBubble: { alignSelf: "flex-start", backgroundColor: "#f1f1f1" },
  bubbleText: { fontSize: 16 },

  traceWrap: {
    maxWidth: "92%",
    alignSelf: "flex-start",
    marginTop: 6,
    marginLeft: 2,
  },
  traceHeader: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fafafa",
  },
  traceHeaderText: { fontSize: 13, color: "#333", fontWeight: "600" },
  traceBody: { marginTop: 8, gap: 8 },
  traceCard: {
    borderWidth: 1,
    borderColor: "#ededed",
    backgroundColor: "#fbfbfb",
    borderRadius: 10,
    padding: 10,
  },
  traceTitle: { fontSize: 12, fontWeight: "700", marginBottom: 6, color: "#222" },
  traceJson: { fontSize: 12, color: "#222", fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }) },

  inputRow: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2f80ed",
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  tip: { paddingHorizontal: 12, paddingBottom: 6, color: "#777" },
  backendHint: { paddingHorizontal: 12, paddingBottom: 10, color: "#999", fontSize: 12 },
});
