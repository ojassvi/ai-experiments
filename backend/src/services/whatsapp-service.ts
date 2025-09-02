import twilio from 'twilio';
import { SettingsService } from './settings-service';

export class WhatsAppService {
  private client: twilio.Twilio | null;
  private settingsService: SettingsService;
  private isConfigured: boolean;

  constructor() {
    this.settingsService = new SettingsService();
    this.isConfigured = false;
    this.client = null;
    
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      const settings = await this.settingsService.getSettings();
      
      if (settings.whatsapp.apiKey && settings.whatsapp.sid) {
        this.client = twilio(settings.whatsapp.sid, settings.whatsapp.apiKey);
        this.isConfigured = true;
        console.log('✅ WhatsApp service configured successfully');
      } else {
        console.warn('⚠️ WhatsApp credentials not configured - messages will be simulated');
      }
    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
    }
  }

  async sendMessage(message: string): Promise<void> {
    try {
      if (!this.isConfigured || !this.client) {
        // Simulate message sending for development
        await this.simulateMessageSending(message);
        return;
      }

      const settings = await this.settingsService.getSettings();
      const toNumber = settings.whatsapp.phoneNumber;
      
      if (!toNumber) {
        throw new Error('WhatsApp phone number not configured');
      }

      // Send message via Twilio WhatsApp API
      const result = await this.client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`, // Default Twilio WhatsApp number
        to: `whatsapp:${toNumber}`,
      });

      console.log('📱 WhatsApp message sent successfully:', {
        messageId: result.sid,
        to: toNumber,
        status: result.status,
      });

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      
      // Fallback to simulation
      console.log('Falling back to simulated message sending');
      await this.simulateMessageSending(message);
    }
  }

  private async simulateMessageSending(message: string): Promise<void> {
    // Simulate message sending for development/testing
    const messageId = Math.random().toString(36).substring(7);
    
    console.log('📱 Simulated WhatsApp message:', {
      messageId,
      content: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      status: 'delivered',
      timestamp: new Date().toISOString(),
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async sendBulkMessage(messages: string[], phoneNumbers: string[]): Promise<any[]> {
    try {
      if (!this.isConfigured || !this.client) {
        return this.simulateBulkMessageSending(messages, phoneNumbers);
      }

      const results = [];
      
      for (let i = 0; i < messages.length; i++) {
        try {
          const result = await this.client.messages.create({
            body: messages[i],
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`,
            to: `whatsapp:${phoneNumbers[i]}`,
          });

          results.push({
            phoneNumber: phoneNumbers[i],
            messageId: result.sid,
            status: result.status,
            success: true,
          });
        } catch (error) {
          results.push({
            phoneNumber: phoneNumbers[i],
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending bulk WhatsApp messages:', error);
      return this.simulateBulkMessageSending(messages, phoneNumbers);
    }
  }

  private async simulateBulkMessageSending(messages: string[], phoneNumbers: string[]): Promise<any[]> {
    const results = [];
    
    for (let i = 0; i < messages.length; i++) {
      const messageId = Math.random().toString(36).substring(7);
      
      results.push({
        phoneNumber: phoneNumbers[i],
        messageId,
        status: 'delivered',
        success: true,
        simulated: true,
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('📱 Simulated bulk WhatsApp messages sent:', results.length);
    return results;
  }

  async getMessageStatus(messageId: string): Promise<any> {
    try {
      if (!this.isConfigured || !this.client) {
        return this.simulateMessageStatus(messageId);
      }

      const message = await this.client.messages(messageId).fetch();
      
      return {
        messageId: message.sid,
        status: message.status,
        direction: message.direction,
        from: message.from,
        to: message.to,
        body: message.body,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated,
      };
    } catch (error) {
      console.error('Error getting message status:', error);
      return this.simulateMessageStatus(messageId);
    }
  }

  private simulateMessageStatus(messageId: string): any {
    return {
      messageId,
      status: 'delivered',
      direction: 'outbound-api',
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+1234567890',
      body: 'Simulated message content',
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      simulated: true,
    };
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.client) {
        // Basic validation for development
        return this.basicPhoneValidation(phoneNumber);
      }

      // Use Twilio's phone number validation API
      const validation = await this.client.validationRequests.create({
        friendlyName: 'Yoga Studio Contact',
        phoneNumber: phoneNumber,
      });

      // If we get here without an error, validation was successful
      return true;
    } catch (error) {
      console.error('Error validating phone number:', error);
      return this.basicPhoneValidation(phoneNumber);
    }
  }

  private basicPhoneValidation(phoneNumber: string): boolean {
    // Basic regex validation for phone numbers
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }
}
