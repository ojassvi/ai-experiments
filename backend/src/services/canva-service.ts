import axios from 'axios';

export class CanvaService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CANVA_API_KEY || '';
    this.baseUrl = 'https://api.canva.com';
    
    if (!this.apiKey) {
      console.warn('CANVA_API_KEY not configured - poster creation will be simulated');
    }
  }

  async createPoster(content: string): Promise<string> {
    try {
      if (!this.apiKey) {
        // Simulate poster creation for development
        return this.simulatePosterCreation(content);
      }

      // Parse the content to extract design specifications
      const designSpec = this.parseDesignSpec(content);
      
      // Create poster using Canva API
      const posterUrl = await this.createPosterWithAPI(designSpec);
      
      return posterUrl;
    } catch (error) {
      console.error('Error creating poster:', error);
      
      // Fallback to simulation
      console.log('Falling back to simulated poster creation');
      return this.simulatePosterCreation(content);
    }
  }

  private parseDesignSpec(content: string): {
    title: string;
    subtitle: string;
    details: string;
    colors: string[];
    layout: string;
  } {
    try {
      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || 'Yoga Workshop',
          subtitle: parsed.subtitle || 'Join us for a transformative experience',
          details: parsed.details || 'Discover inner peace and wellness',
          colors: parsed.colors || ['#4F46E5', '#10B981', '#F59E0B'],
          layout: parsed.layout || 'centered design',
        };
      }
    } catch (error) {
      console.error('Failed to parse design spec:', error);
    }

    // Fallback parsing
    return {
      title: 'Yoga Workshop',
      subtitle: 'Join us for a transformative experience',
      details: content.substring(0, 120),
      colors: ['#4F46E5', '#10B981', '#F59E0B'],
      layout: 'centered design',
    };
  }

  private async createPosterWithAPI(designSpec: {
    title: string;
    subtitle: string;
    details: string;
    colors: string[];
    layout: string;
  }): Promise<string> {
    try {
      // This is a placeholder for the actual Canva API integration
      // The real implementation would use Canva's Design API
      
      const response = await axios.post(
        `${this.baseUrl}/v1/designs`,
        {
          type: 'poster',
          dimensions: { width: 1080, height: 1350 }, // Instagram story dimensions
          elements: [
            {
              type: 'text',
              content: designSpec.title,
              position: { x: 540, y: 200 },
              style: {
                fontSize: 48,
                fontWeight: 'bold',
                color: designSpec.colors[0],
                textAlign: 'center',
              },
            },
            {
              type: 'text',
              content: designSpec.subtitle,
              position: { x: 540, y: 300 },
              style: {
                fontSize: 24,
                color: designSpec.colors[1],
                textAlign: 'center',
              },
            },
            {
              type: 'text',
              content: designSpec.details,
              position: { x: 540, y: 500 },
              style: {
                fontSize: 18,
                color: designSpec.colors[2],
                textAlign: 'center',
                maxWidth: 800,
              },
            },
          ],
          background: {
            type: 'gradient',
            colors: [designSpec.colors[0], designSpec.colors[1]],
            direction: 'to bottom',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Return the design URL
      return response.data.designUrl || response.data.shareUrl;
    } catch (error) {
      console.error('Canva API error:', error);
      throw new Error('Failed to create poster with Canva API');
    }
  }

  private simulatePosterCreation(content: string): string {
    // Simulate poster creation for development/testing
    const posterId = Math.random().toString(36).substring(7);
    const simulatedUrl = `https://canva.com/design/${posterId}/view`;
    
    console.log('🎨 Simulated poster creation:', {
      content: content.substring(0, 100) + '...',
      posterUrl: simulatedUrl,
    });
    
    return simulatedUrl;
  }

  async getPosterTemplates(): Promise<any[]> {
    try {
      if (!this.apiKey) {
        return this.getSimulatedTemplates();
      }

      const response = await axios.get(`${this.baseUrl}/v1/templates`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        params: {
          type: 'poster',
          category: 'wellness',
          limit: 10,
        },
      });

      return response.data.templates || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.getSimulatedTemplates();
    }
  }

  private getSimulatedTemplates(): any[] {
    return [
      {
        id: 'template-1',
        name: 'Zen Wellness',
        thumbnail: 'https://via.placeholder.com/300x400/4F46E5/FFFFFF?text=Zen+Wellness',
        category: 'wellness',
      },
      {
        id: 'template-2',
        name: 'Mindful Movement',
        thumbnail: 'https://via.placeholder.com/300x400/10B981/FFFFFF?text=Mindful+Movement',
        category: 'wellness',
      },
      {
        id: 'template-3',
        name: 'Inner Peace',
        thumbnail: 'https://via.placeholder.com/300x400/F59E0B/FFFFFF?text=Inner+Peace',
        category: 'wellness',
      },
    ];
  }
}
