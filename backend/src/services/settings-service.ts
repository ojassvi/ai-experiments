import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

interface Settings {
  whatsapp: {
    apiKey: string;
    sid: string;
    phoneNumber: string;
  };
}

export class SettingsService {
  private settingsFile: string;
  private encryptionKey: string;

  constructor() {
    this.settingsFile = path.join(process.cwd(), 'data', 'settings.json');
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory() {
    try {
      await fs.ensureDir(path.dirname(this.settingsFile));
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  async getSettings(): Promise<Settings> {
    try {
      if (await fs.pathExists(this.settingsFile)) {
        const encryptedData = await fs.readFile(this.settingsFile, 'utf8');
        const decryptedData = this.decrypt(encryptedData);
        return JSON.parse(decryptedData);
      }
    } catch (error) {
      console.error('Error reading settings:', error);
    }

    // Return default settings
    return {
      whatsapp: {
        apiKey: '',
        sid: '',
        phoneNumber: '',
      },
    };
  }

  async saveSettings(settings: Settings): Promise<void> {
    try {
      const jsonData = JSON.stringify(settings, null, 2);
      const encryptedData = this.encrypt(jsonData);
      
      await fs.writeFile(this.settingsFile, encryptedData, 'utf8');
      
      console.log('✅ Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateWhatsAppSettings(whatsapp: Settings['whatsapp']): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      currentSettings.whatsapp = whatsapp;
      await this.saveSettings(currentSettings);
    } catch (error) {
      console.error('Error updating WhatsApp settings:', error);
      throw error;
    }
  }



  async validateSettings(settings: Settings): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate WhatsApp settings
    if (settings.whatsapp.apiKey && !this.isValidApiKey(settings.whatsapp.apiKey)) {
      errors.push('Invalid WhatsApp API key format');
    }
    
    if (settings.whatsapp.sid && !this.isValidSid(settings.whatsapp.sid)) {
      errors.push('Invalid WhatsApp SID format');
    }
    
    if (settings.whatsapp.phoneNumber && !this.isValidPhoneNumber(settings.whatsapp.phoneNumber)) {
      errors.push('Invalid phone number format (must include country code)');
    }



    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private isValidApiKey(apiKey: string): boolean {
    // Basic validation - API keys are typically long alphanumeric strings
    return apiKey.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(apiKey);
  }

  private isValidSid(sid: string): boolean {
    // Twilio SID format: starts with AC and is 34 characters
    return /^AC[a-f0-9]{32}$/.test(sid);
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // International phone number format
    return /^\+[1-9]\d{1,14}$/.test(phoneNumber);
  }

  private encrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  async getEnvironmentSettings(): Promise<{
    openai: boolean;
    twilio: boolean;
  }> {
    return {
      openai: !!process.env.OPENAI_API_KEY,
      twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    };
  }

  async exportSettings(): Promise<string> {
    try {
      const settings = await this.getSettings();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw new Error('Failed to export settings');
    }
  }

  async importSettings(settingsJson: string): Promise<void> {
    try {
      const settings = JSON.parse(settingsJson);
      const validation = await this.validateSettings(settings);
      
      if (!validation.valid) {
        throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
      }
      
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error(`Failed to import settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resetSettings(): Promise<void> {
    try {
      const defaultSettings: Settings = {
        whatsapp: {
          apiKey: '',
          sid: '',
          phoneNumber: '',
        },

      };
      
      await this.saveSettings(defaultSettings);
      console.log('✅ Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}
