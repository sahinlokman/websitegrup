export interface TelegramGroup {
  id: string;
  name: string;
  description: string;
  image?: string;
  members: number;
  category: string;
  tags: string[];
  link: string;
  verified: boolean;
  featured: boolean;
  approved?: boolean;
  username?: string;
  photo?: string;
  type?: 'group' | 'supergroup' | 'channel';
  createdAt: Date;
  userId?: string;
}

export interface TelegramApiResponse {
  ok: boolean;
  result?: {
    id: number;
    title: string;
    description?: string;
    username?: string;
    type: string;
    photo?: {
      small_file_id: string;
      small_file_unique_id: string;
      big_file_id: string;
      big_file_unique_id: string;
    };
    invite_link?: string;
    member_count?: number;
  };
  error_code?: number;
  description?: string;
}

export interface AddGroupFormData {
  username: string;
  category: string;
  customTags?: string[];
}