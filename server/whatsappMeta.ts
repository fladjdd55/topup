import { handleIncomingWhatsAppMessage } from './whatsappBot';

// Variables d'environnement
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// URL de l'API Graph de Facebook
const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

interface WhatsAppMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  text: {
    preview_url: boolean;
    body: string;
  };
}

interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: {
          name: string;
        };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        text?: {
          body: string;
        };
        type: string;
      }>;
    };
    field: string;
  }>;
}

// Envoyer un message WhatsApp via l'API Meta
export async function sendWhatsAppMetaMessage(to: string, message: string): Promise<any> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp credentials not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID');
  }

  const url = `${GRAPH_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const payload: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'text',
    text: {
      preview_url: true,
      body: message
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
    }

    console.log('✅ WhatsApp message sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

// Vérifier le webhook (GET request de Meta)
export function verifyWebhook(mode: string, token: string, challenge: string): string | null {
  if (!WHATSAPP_VERIFY_TOKEN) {
    console.error('WHATSAPP_VERIFY_TOKEN not set');
    return null;
  }

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    return challenge;
  }

  console.error('❌ Webhook verification failed');
  return null;
}

// Traiter un webhook entrant (POST request de Meta)
export async function handleWhatsAppWebhook(body: any): Promise<void> {
  try {
    // Vérifier que c'est un message WhatsApp
    if (body.object !== 'whatsapp_business_account') {
      console.log('Not a WhatsApp Business message');
      return;
    }

    // Extraire les messages
    const entry: WhatsAppWebhookEntry = body.entry?.[0];
    if (!entry) {
      console.log('No entry found in webhook');
      return;
    }

    const changes = entry.changes?.[0];
    if (!changes) {
      console.log('No changes found in webhook');
      return;
    }

    const value = changes.value;
    const messages = value.messages;

    if (!messages || messages.length === 0) {
      console.log('No messages in webhook');
      return;
    }

    // Traiter chaque message
    for (const message of messages) {
      const from = message.from;
      const messageId = message.id;
      const messageBody = message.text?.body;

      if (!messageBody) {
        console.log('Message has no text body');
        continue;
      }

      console.log(`📱 WhatsApp message received from ${from}: ${messageBody}`);

      // Marquer le message comme lu
      await markMessageAsRead(messageId);

      // Traiter le message avec notre bot
      const responseMessage = await handleIncomingWhatsAppMessage(from, messageBody);

      // Envoyer la réponse
      await sendWhatsAppMetaMessage(from, responseMessage);
    }
  } catch (error) {
    console.error('Error handling WhatsApp webhook:', error);
    throw error;
  }
}

// Marquer un message comme lu
async function markMessageAsRead(messageId: string): Promise<void> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return;
  }

  const url = `${GRAPH_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });

    console.log('✅ Message marked as read:', messageId);
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

// Envoyer un message avec boutons (optionnel)
export async function sendWhatsAppInteractiveMessage(
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<any> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp credentials not configured');
  }

  const url = `${GRAPH_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: bodyText
      },
      action: {
        buttons: buttons.map(btn => ({
          type: 'reply',
          reply: {
            id: btn.id,
            title: btn.title
          }
        }))
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error('Error sending interactive message:', error);
    throw error;
  }
}

// Envoyer une notification de transaction via WhatsApp
export async function notifyTransactionViaWhatsApp(
  phoneNumber: string,
  transactionId: string,
  status: 'success' | 'pending' | 'failed',
  amount: number,
  currency: string,
  operatorName?: string
) {
  try {
    // Import de la fonction depuis whatsappBot.ts
    const { notifyTransactionStatus } = await import('./whatsappBot');
    
    // La fonction notifyTransactionStatus gère déjà les traductions
    // mais elle utilise Twilio, donc on va créer notre propre message ici
    let message = '';
    
    if (status === 'success') {
      message = `✅ *Recharge réussie !*\n\nMontant : ${amount} ${currency}\nOpérateur : ${operatorName || 'N/A'}\nTransaction : ${transactionId}\n\nMerci d'utiliser TapTopLoad ! 🎉`;
    } else if (status === 'pending') {
      message = `⏳ *Recharge en cours...*\n\nMontant : ${amount} ${currency}\nTransaction : ${transactionId}\n\nNous vous informerons dès que c'est terminé.`;
    } else {
      message = `❌ *Échec de la recharge*\n\nMontant : ${amount} ${currency}\nTransaction : ${transactionId}\n\nContactez notre support pour assistance.`;
    }
    
    await sendWhatsAppMetaMessage(phoneNumber, message);
  } catch (error) {
    console.error('Error sending transaction notification:', error);
  }
}
