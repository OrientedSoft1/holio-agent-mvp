import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GiphyImage {
  url?: string;
}

interface GiphyItem {
  id: string;
  title?: string;
  images?: {
    original?: GiphyImage;
    downsized_medium?: GiphyImage;
    fixed_width?: GiphyImage;
    preview_gif?: GiphyImage;
  };
}

interface GiphyApiResponse {
  data?: GiphyItem[];
}

export interface GifResult {
  id: string;
  url: string;
  previewUrl: string;
  title: string;
}

@Injectable()
export class GifsService {
  private readonly logger = new Logger(GifsService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.giphy.com/v1/gifs';

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('GIPHY_API_KEY', '');
  }

  async trending(limit = 20): Promise<GifResult[]> {
    if (!this.apiKey) return this.fallbackGifs(limit);
    try {
      const res = await fetch(
        `${this.baseUrl}/trending?api_key=${this.apiKey}&limit=${limit}&rating=g`,
      );
      const json = (await res.json()) as GiphyApiResponse;
      return this.mapGiphyResponse(json.data ?? []);
    } catch (err) {
      this.logger.warn(`GIPHY trending failed: ${err}`);
      return this.fallbackGifs(limit);
    }
  }

  async search(query: string, limit = 20): Promise<GifResult[]> {
    if (!this.apiKey || !query?.trim()) return [];
    try {
      const q = encodeURIComponent(query);
      const res = await fetch(
        `${this.baseUrl}/search?api_key=${this.apiKey}&q=${q}&limit=${limit}&rating=g`,
      );
      const json = (await res.json()) as GiphyApiResponse;
      return this.mapGiphyResponse(json.data ?? []);
    } catch (err) {
      this.logger.warn(`GIPHY search failed: ${err}`);
      return [];
    }
  }

  private mapGiphyResponse(data: GiphyItem[]): GifResult[] {
    return data.map((item) => ({
      id: item.id,
      url:
        item.images?.original?.url ?? item.images?.downsized_medium?.url ?? '',
      previewUrl:
        item.images?.fixed_width?.url ?? item.images?.preview_gif?.url ?? '',
      title: item.title ?? '',
    }));
  }

  private fallbackGifs(limit: number): GifResult[] {
    return Array.from({ length: Math.min(limit, 12) }, (_, i) => ({
      id: `fallback-${i}`,
      url: `https://placehold.co/200x150/D1CBFB/152022?text=GIF+${i + 1}`,
      previewUrl: `https://placehold.co/200x150/D1CBFB/152022?text=GIF+${i + 1}`,
      title: `GIF ${i + 1}`,
    }));
  }
}
