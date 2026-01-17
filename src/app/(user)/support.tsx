import { supabase } from '@/lib/supabase';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const SUBJECTS = ['Payment', 'Login', 'Delivery', 'Other'] as const;

export default function SupportScreen() {
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>('Payment');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const canSend = useMemo(() => message.trim().length >= 3 && !isSending, [message, isSending]);

  const onSend = async () => {
    try {
      setIsSending(true);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        Alert.alert('Not signed in', 'Please sign in again.');
        return;
      }

      const userId = authData.user.id;

      const { error } = await supabase.from('support_tickets').insert({
        user_id: userId,
        subject,
        message: message.trim(),
        status: 'OPEN',
      });

      if (error) throw error;

      Alert.alert('Success', 'Support ticket created. Our team will review it.');
      setMessage('');
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? 'Could not send support request');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support</Text>
      <Text style={styles.sub}>Quick help + contact us</Text>

      <View style={styles.card}>
        <Text style={styles.h}>FAQ</Text>

        <Text style={styles.q}>How does the loyalty reward work?</Text>
        <Text style={styles.a}>After 5 paid orders, your next order automatically gets 50% off.</Text>

        <Text style={styles.q}>Payment went through but I don’t see my order.</Text>
        <Text style={styles.a}>Please send a message below with the time + order number if available.</Text>

        <Text style={styles.q}>How do I change my delivery details?</Text>
        <Text style={styles.a}>Send a support request with your order number and updated instructions.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>Contact Support</Text>

        <Text style={styles.label}>Subject</Text>
        <View style={styles.subjectRow}>
          {SUBJECTS.map((s) => (
            <Pressable
              key={s}
              onPress={() => setSubject(s)}
              style={[styles.pill, subject === s && styles.pillActive]}
            >
              <Text style={[styles.pillText, subject === s && styles.pillTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Message</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your issue..."
          style={[styles.input, styles.textarea]}
          multiline
        />

        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={[styles.button, !canSend && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{isSending ? 'Sending...' : 'Send message'}</Text>
        </Pressable>

        <Text style={styles.hint}>This creates a ticket in Supabase linked to your account.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '900' },
  sub: { marginTop: 6, color: '#777', fontWeight: '600' },

  card: {
    marginTop: 14,
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    padding: 14,
  },

  h: { fontSize: 16, fontWeight: '900', marginBottom: 10 },
  q: { fontSize: 14, fontWeight: '800', marginTop: 10 },
  a: { fontSize: 13, color: '#333', marginTop: 4, fontWeight: '600' },

  label: { marginTop: 10, marginBottom: 6, fontWeight: '800', color: '#444' },

  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#e9e9e9' },
  pillActive: { backgroundColor: '#111' },
  pillText: { fontWeight: '800', color: '#333' },
  pillTextActive: { color: '#fff' },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eaeaea',
    fontWeight: '600',
  },
  textarea: { height: 120, textAlignVertical: 'top' },

  button: {
    marginTop: 12,
    backgroundColor: '#1e6af5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#cfcfcf' },
  buttonText: { color: '#fff', fontWeight: '900' },
  hint: { marginTop: 8, fontSize: 12, color: '#777', fontWeight: '600' },
});
