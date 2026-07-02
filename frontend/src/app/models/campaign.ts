import { Token } from './token';

export interface StorySlide {
  url: string;
  title: string;
  description: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  archivedAt: string;
  slides: StorySlide[];
}

export interface Scene {
  id: string;
  name: string;
  mapBackgroundImage: string | null;
  tokens: Token[];
  fogOfWar: string[];
  isFogEnabled: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  createdAt: Date;
  lastPlayedAt: Date;
  tokens?: Token[];
  mapBackgroundImage?: string | null;
  fogOfWar?: string[];
  isFogEnabled?: boolean;
  scenes?: Scene[];
  activeSceneId?: string | null;
  storySlides?: StorySlide[];
  chapterHistory?: Chapter[];
  currentChapter?: number;
  currentHour?: number;
  currentMinute?: number;
  currentDay?: number;
}
