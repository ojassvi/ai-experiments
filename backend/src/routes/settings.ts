import { Router, Request, Response } from 'express';
import { SettingsService } from '../services/settingsService';

const router = Router();
const settingsService = new SettingsService();

// Get current settings
router.get('/', async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getSettings();
    
    // Don't return sensitive data in GET requests
    const safeSettings = {
      whatsapp: {
        apiKey: settings.whatsapp.apiKey ? '***configured***' : '',
        sid: settings.whatsapp.sid ? '***configured***' : '',
        phoneNumber: settings.whatsapp.phoneNumber || '',
      },
      canva: {
        apiKey: settings.canva.apiKey ? '***configured***' : '',
      },
    };
    
    res.json(safeSettings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// Save settings
router.post('/', async (req: Request, res: Response) => {
  try {
    const settings = req.body;
    
    // Validate settings
    const validation = await settingsService.validateSettings(settings);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid settings',
        details: validation.errors,
      });
    }
    
    // Save settings
    await settingsService.saveSettings(settings);
    
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Update WhatsApp settings
router.put('/whatsapp', async (req: Request, res: Response) => {
  try {
    const whatsappSettings = req.body;
    
    // Validate WhatsApp settings
    const currentSettings = await settingsService.getSettings();
    const testSettings = {
      ...currentSettings,
      whatsapp: whatsappSettings,
    };
    
    const validation = await settingsService.validateSettings(testSettings);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid WhatsApp settings',
        details: validation.errors,
      });
    }
    
    // Update WhatsApp settings
    await settingsService.updateWhatsAppSettings(whatsappSettings);
    
    res.json({ message: 'WhatsApp settings updated successfully' });
  } catch (error) {
    console.error('Error updating WhatsApp settings:', error);
    res.status(500).json({ error: 'Failed to update WhatsApp settings' });
  }
});

// Update Canva settings
router.put('/canva', async (req: Request, res: Response) => {
  try {
    const canvaSettings = req.body;
    
    // Validate Canva settings
    const currentSettings = await settingsService.getSettings();
    const testSettings = {
      ...currentSettings,
      canva: canvaSettings,
    };
    
    const validation = await settingsService.validateSettings(testSettings);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid Canva settings',
        details: validation.errors,
      });
    }
    
    // Update Canva settings
    await settingsService.updateCanvaSettings(canvaSettings);
    
    res.json({ message: 'Canva settings updated successfully' });
  } catch (error) {
    console.error('Error updating Canva settings:', error);
    res.status(500).json({ error: 'Failed to update Canva settings' });
  }
});

// Get environment status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const envStatus = await settingsService.getEnvironmentSettings();
    res.json(envStatus);
  } catch (error) {
    console.error('Error getting environment status:', error);
    res.status(500).json({ error: 'Failed to get environment status' });
  }
});

// Export settings
router.get('/export', async (req: Request, res: Response) => {
  try {
    const settingsJson = await settingsService.exportSettings();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="settings.json"');
    res.send(settingsJson);
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({ error: 'Failed to export settings' });
  }
});

// Import settings
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({ error: 'Settings data is required' });
    }
    
    await settingsService.importSettings(settings);
    res.json({ message: 'Settings imported successfully' });
  } catch (error) {
    console.error('Error importing settings:', error);
    res.status(500).json({ error: 'Failed to import settings' });
  }
});

// Reset settings
router.post('/reset', async (req: Request, res: Response) => {
  try {
    await settingsService.resetSettings();
    res.json({ message: 'Settings reset to defaults' });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

export { router as settingsRouter };
