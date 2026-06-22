export interface MarketingTool {
  id: string;

  title: string;
  category: string;
  keywords: string[] | null;
  description: string | null;

  thumbnail_url: string | null;
  thumbnail_path: string | null;
  thumbnail_name: string | null;

  file_url?: string | null;
  file_name?: string | null;
  file_path?: string | null;
  file_type?: string | null;

  created_at: string;
  updated_at?: string | null;
}