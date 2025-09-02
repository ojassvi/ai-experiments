import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export class MarkdownService {
  private contentDir: string;

  constructor() {
    this.contentDir = path.join(process.cwd(), 'content', 'events');
    this.ensureContentDirectory();
  }

  private async ensureContentDirectory() {
    try {
      await fs.ensureDir(this.contentDir);
      console.log('📁 Content directory ensured:', this.contentDir);
    } catch (error) {
      console.error('Error creating content directory:', error);
    }
  }

  async savePost(content: string, eventDescription: string): Promise<string> {
    try {
      // Parse the markdown content to extract frontmatter
      const parsed = matter(content);
      
      // Generate filename from title or create a fallback
      let filenameSource = parsed.data.title;
      
      // If no title or title is too long, create a better fallback
      if (!filenameSource || filenameSource.length > 200) {
        // Extract first few words from description for a meaningful filename
        const words = eventDescription
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 2)
          .slice(0, 5); // Take first 5 meaningful words
        
        filenameSource = words.length > 0 ? words.join('-') : 'yoga-event';
      }
      
      const filename = this.generateFilename(filenameSource);
      const filePath = path.join(this.contentDir, filename);
      
      // Ensure the content directory exists
      await fs.ensureDir(path.dirname(filePath));
      
      // Write the markdown file
      await fs.writeFile(filePath, content, 'utf8');
      
      console.log('📝 Markdown post saved:', {
        filename,
        filePath,
        title: parsed.data.title,
        date: parsed.data.date,
      });
      
      return filename;
    } catch (error) {
      console.error('Error saving markdown post:', error);
      throw new Error(`Failed to save markdown post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateFilename(title: string): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Clean the title for filename
    let cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    // Limit filename length to prevent ENAMETOOLONG error
    // Most filesystems have a limit of 255 characters for filename
    // We'll use a more conservative limit of 100 characters for the title part
    const maxTitleLength = 100;
    if (cleanTitle.length > maxTitleLength) {
      // Truncate and add a hash to make it unique
      const truncated = cleanTitle.substring(0, maxTitleLength - 8); // Leave room for hash
      const hash = Math.random().toString(36).substring(2, 8); // 6 character hash
      cleanTitle = `${truncated}-${hash}`;
    }
    
    return `${dateStr}-${cleanTitle}.md`;
  }

  async generatePostFromTemplate(eventDescription: string): Promise<string> {
    try {
      // Generate content using a template
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      
      // Extract event details
      const eventDetails = this.extractEventDetails(eventDescription);
      
      // Create frontmatter
      const frontmatter = {
        title: eventDetails.title,
        date: dateStr,
        tags: ['yoga', 'workshop', 'wellness', 'event'],
        description: eventDetails.description,
        author: 'Yoga Studio Team',
        image: eventDetails.image || '/images/yoga-workshop.jpg',
        featured: false,
      };
      
      // Generate markdown content
      const content = this.generateMarkdownContent(frontmatter, eventDetails);
      
      // Save the post
      const filename = await this.savePost(content, eventDescription);
      
      return filename;
    } catch (error) {
      console.error('Error generating post from template:', error);
      throw error;
    }
  }

  private extractEventDetails(description: string): {
    title: string;
    description: string;
    date?: string;
    time?: string;
    location?: string;
    theme?: string;
    image?: string;
  } {
    // Extract date patterns
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, // MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/g, // MM-DD-YYYY
      /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?/gi, // Month DD
      /(\d{1,2}):(\d{2})\s*(AM|PM)/gi, // HH:MM AM/PM
    ];
    
    // Extract location patterns
    const locationPatterns = [
      /at\s+([^,]+)/gi,
      /in\s+([^,]+)/gi,
      /location:\s*([^,]+)/gi,
    ];
    
    // Extract theme patterns
    const themePatterns = [
      /theme:\s*([^,]+)/gi,
      /focus:\s*([^,]+)/gi,
      /about\s+([^,]+)/gi,
    ];
    
    let title = 'Yoga Workshop';
    let date: string | undefined;
    let time: string | undefined;
    let location: string | undefined;
    let theme: string | undefined;
    
    // Try to extract a meaningful title
    if (description.includes('workshop')) {
      title = 'Yoga Workshop';
    } else if (description.includes('class')) {
      title = 'Yoga Class';
    } else if (description.includes('session')) {
      title = 'Yoga Session';
    }
    
    // Extract date and time
    const dateMatch = description.match(/(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?/i);
    if (dateMatch) {
      date = `${dateMatch[1]} ${dateMatch[2]}`;
    }
    
    const timeMatch = description.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      time = `${timeMatch[1]}:${timeMatch[2]} ${timeMatch[3]}`;
    }
    
    // Extract location
    const locationMatch = description.match(/at\s+([^,]+)/i);
    if (locationMatch) {
      location = locationMatch[1].trim();
    }
    
    // Extract theme
    const themeMatch = description.match(/theme:\s*([^,]+)/i);
    if (themeMatch) {
      theme = themeMatch[1].trim();
    }
    
    return {
      title,
      description,
      date,
      time,
      location,
      theme,
    };
  }

  private generateMarkdownContent(frontmatter: any, eventDetails: any): string {
    const { title, date, tags, description, author, image, featured } = frontmatter;
    
    // Create frontmatter string
    const frontmatterStr = matter.stringify('', {
      title,
      date,
      tags,
      description,
      author,
      image,
      featured,
    });
    
    // Generate content
    const content = `# ${title}

${description}

${eventDetails.date ? `**Date:** ${eventDetails.date}` : ''}
${eventDetails.time ? `**Time:** ${eventDetails.time}` : ''}
${eventDetails.location ? `**Location:** ${eventDetails.location}` : ''}
${eventDetails.theme ? `**Theme:** ${eventDetails.theme}` : ''}

## About This Event

Join us for a transformative yoga experience that will help you find inner peace and wellness. This workshop is designed for practitioners of all levels, from beginners to advanced yogis.

## What to Expect

- **Guided Practice**: Expert-led yoga session
- **Mindfulness**: Breathing and meditation techniques
- **Community**: Connect with like-minded individuals
- **Wellness**: Focus on physical and mental health

## What to Bring

- Comfortable yoga mat
- Water bottle
- Comfortable clothing
- Open mind and heart

## Registration

To secure your spot in this workshop, please contact us or register through our website. Space is limited to ensure a personalized experience.

## Contact Information

- **Phone:** [Your Studio Phone]
- **Email:** [Your Studio Email]
- **Website:** [Your Studio Website]

---

*We look forward to sharing this journey with you. Namaste! 🙏*

*This event is part of our ongoing commitment to promoting wellness and mindfulness in our community.*`;

    return frontmatterStr + content;
  }

  async getAllPosts(): Promise<any[]> {
    try {
      const files = await fs.readdir(this.contentDir);
      const posts: Array<{ filename: string; content: string; date?: string; [key: string]: any }> = [];
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(this.contentDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const parsed = matter(content);
          
          posts.push({
            filename: file,
            ...parsed.data,
            content: parsed.content,
          });
        }
      }
      
      // Sort by date (newest first)
      posts.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
      
      return posts;
    } catch (error) {
      console.error('Error reading posts:', error);
      return [];
    }
  }

  async getPost(filename: string): Promise<any> {
    try {
      const filePath = path.join(this.contentDir, filename);
      const content = await fs.readFile(filePath, 'utf8');
      const parsed = matter(content);
      
      return {
        filename,
        ...parsed.data,
        content: parsed.content,
        html: marked(parsed.content),
      };
    } catch (error) {
      console.error('Error reading post:', error);
      throw new Error(`Post not found: ${filename}`);
    }
  }

  async deletePost(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.contentDir, filename);
      await fs.remove(filePath);
      console.log('📝 Post deleted:', filename);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error(`Failed to delete post: ${filename}`);
    }
  }
}
