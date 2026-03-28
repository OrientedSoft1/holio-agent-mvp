import { Injectable, Logger } from '@nestjs/common';

export interface LinkPreview {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  url: string;
}

@Injectable()
export class LinkPreviewService {
  private readonly logger = new Logger(LinkPreviewService.name);

  async extractPreview(url: string): Promise<LinkPreview | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'HolioAgent/1.0 LinkPreview',
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return null;
      }

      const html = await response.text();

      return {
        title: this.extractMetaContent(html, 'og:title'),
        description: this.extractMetaContent(html, 'og:description'),
        imageUrl: this.extractMetaContent(html, 'og:image'),
        url,
      };
    } catch (err) {
      this.logger.debug(`Failed to fetch link preview for ${url}: ${err}`);
      return null;
    }
  }

  private extractMetaContent(html: string, property: string): string | null {
    const regex = new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      'i',
    );
    const match = regex.exec(html);
    if (match) return match[1];

    const reversed = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      'i',
    );
    const revMatch = reversed.exec(html);
    return revMatch ? revMatch[1] : null;
  }
}
