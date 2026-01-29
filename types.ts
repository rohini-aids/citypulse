export enum UpdateCategory {
  TRAFFIC = 'TRAFFIC',
  CROWD = 'CROWD',
  ISSUE = 'ISSUE',
  EVENT = 'EVENT',
  NEIGHBORHOOD = 'NEIGHBORHOOD',
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CityUpdate {
  id: string;
  category: UpdateCategory;
  description: string;
  timestamp: number;
  location: Coordinates;
  expiresAt: number;
  authorId?: string;
  likes: number;
}

export interface ViewState {
  mode: 'MAP' | 'FEED';
  center: Coordinates;
  zoom: number;
}

export const CATEGORY_COLORS: Record<UpdateCategory, string> = {
  [UpdateCategory.TRAFFIC]: '#ef4444', // Red
  [UpdateCategory.CROWD]: '#f59e0b', // Amber
  [UpdateCategory.ISSUE]: '#f97316', // Orange
  [UpdateCategory.EVENT]: '#8b5cf6', // Violet
  [UpdateCategory.NEIGHBORHOOD]: '#10b981', // Emerald
};

export const CATEGORY_LABELS: Record<UpdateCategory, string> = {
  [UpdateCategory.TRAFFIC]: 'Traffic',
  [UpdateCategory.CROWD]: 'Crowd',
  [UpdateCategory.ISSUE]: 'Issue/Hazard',
  [UpdateCategory.EVENT]: 'Event',
  [UpdateCategory.NEIGHBORHOOD]: 'News',
};
