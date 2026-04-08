import type { Menu } from './menu';

export interface RecommendationRequest {
  menu_ids: string[];
}

export interface RecommendedMenu {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

export interface RecommendationResponse {
  recommendations: RecommendedMenu[];
}
