export type ExpoPushMessage = {
  to: string;
  sound?: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export async function sendExpoPush(messages: ExpoPushMessage | ExpoPushMessage[]) {
  const payload = Array.isArray(messages) ? messages : [messages];

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload.length === 1 ? payload[0] : payload),
  });

  const json = await res.json();
  return json;
}
