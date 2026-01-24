import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// ✅ Change this import to whatever your app uses for auth
// If you already have AuthProvider, use that hook.
// Common patterns: useAuth(), useSession(), etc.
import { useAuth } from "@/providers/AuthProvider";

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const BACKEND_URL = "http://localhost:8787"; // ✅ iOS simulator can use localhost

export default function AIAssistantScreen() {
  const { session } = useAuth(); // ✅ MUST exist; if not, change to your hook
  const userId = session?.user?.id;

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! How can I assist you today?",
    },
  ]);

  const canSend = useMemo(() => !!userId && inputText.trim().length > 0 && !loading, [userId, inputText, loading]);

  const send = async () => {
    if (!canSend) return;

    const text = inputText.trim();
    setInputText("");

    const userMsg: ChatMsg = { id: String(Date.now()), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      // ✅ IMPORTANT: Send only { message, userId }
      const resp = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userId,
        }),
      });

      const json = await resp.json().catch(() => null);

      const assistantText =
        json?.message ??
        json?.text ??
        json?.response ??
        (json?.error ? `Error: ${json.error}` : `Error: Unexpected response`);

      const botMsg: ChatMsg = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: String(assistantText),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 2), role: "assistant", content: `Network error: ${e?.message ?? "unknown"}` },
      ]);
    } finally {
      setLoading(false);
    }
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
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.botBubble]}>
                <Text style={styles.bubbleText}>{item.content}</Text>
              </View>
            )}
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
            />

            <TouchableOpacity style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]} onPress={send} disabled={!canSend}>
              {loading ? <ActivityIndicator /> : <Text style={styles.sendText}>Send</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.tip}>
            Try: "Add mutton pizza", "I want something spicy under $15", "Show my cart"
          </Text>
        </>
      )}
    </SafeAreaView>
  );
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
  tip: { paddingHorizontal: 12, paddingBottom: 10, color: "#777" },
});
