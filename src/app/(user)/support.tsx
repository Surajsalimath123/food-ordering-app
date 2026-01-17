import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

export default function SupportScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // ✅ simpler: allow short messages too
  const canSend = useMemo(() => {
    return subject.trim().length >= 1 && message.trim().length >= 1 && !sending;
  }, [subject, message, sending]);

  const submit = async () => {
    try {
      setSending(true);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        Alert.alert('Not signed in', 'Please sign in again.');
        return;
      }

      const userId = authData.user.id;

      const { error } = await supabase.from('support_tickets').insert({
        user_id: userId,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (error) {
        console.log('support ticket insert error', error);
        Alert.alert('Failed', 'Could not send your message. Please try again.');
        return;
      }

      Alert.alert('Sent ✅', 'Thanks! Support will get back to you soon.');
      setSubject('');
      setMessage('');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Support</Text>
        <Text style={styles.subtitle}>Quick help + contact us</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>FAQ</Text>

          <View style={styles.faqItem}>
            <Text style={styles.q}>How does the loyalty reward work?</Text>
            <Text style={styles.a}>
              After 5 paid orders, your next order automatically gets 50% off.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.q}>Payment went through but I don’t see my order.</Text>
            <Text style={styles.a}>
              Please send us a message below with the time + order number if available.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.q}>How do I change my delivery details?</Text>
            <Text style={styles.a}>
              Send a support request with your order number and updated instructions.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Support</Text>

          <Text style={styles.label}>Subject</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g., Payment issue / Order update"
            style={styles.input}
            maxLength={80}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Write details here..."
            style={[styles.input, styles.textarea]}
            multiline
            maxLength={800}
          />

          <Pressable
            onPress={submit}
            disabled={!canSend}
            style={({ pressed }) => [
              styles.button,
              !canSend && styles.buttonDisabled,
              pressed && canSend && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>{sending ? 'Sending...' : 'Send message'}</Text>
          </Pressable>

          <Text style={styles.hint}>
            This creates a ticket in Supabase linked to your account.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f2f2f2' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10, gap: 12 },

  title: { fontSize: 28, fontWeight: '900', color: '#111' },
  subtitle: { marginTop: 2, fontSize: 13, color: '#666', fontWeight: '600' },

  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },

  cardTitle: { fontSize: 16, fontWeight: '900', color: '#111' },

  faqItem: { gap: 4, paddingTop: 6 },
  q: { fontWeight: '800', color: '#111' },
  a: { color: '#555', fontWeight: '600', lineHeight: 18 },

  label: { marginTop: 6, fontSize: 12, fontWeight: '800', color: '#333' },

  input: {
    backgroundColor: '#f6f6f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eaeaea',
    fontWeight: '600',
  },

  textarea: { height: 120, textAlignVertical: 'top' },

  button: {
    marginTop: 10,
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#cfcfcf' },
  buttonPressed: { opacity: 0.75 },
  buttonText: { color: 'white', fontWeight: '900' },

  hint: { marginTop: 8, fontSize: 12, color: '#777', fontWeight: '600' },
});
