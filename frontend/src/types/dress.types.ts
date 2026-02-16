// Color palette item - backend uses name/hex, frontend also accepts color_name/color_code
export interface ColorPaletteItem {
  name?: string;
  hex?: string;
  color_code?: string;
  color_name?: string;
}

// Dress code interface
export interface DressCode {
  id: string;
  wedding_id: string;
  event_name: string;
  event_date?: string;
  description?: string;
  theme?: string;
  theme_description?: string;
  color_palette?: ColorPaletteItem[];
  dress_suggestions_men?: string;
  dress_suggestions_women?: string;
  men_suggestions?: string;
  women_suggestions?: string;
  image_urls?: string[];
  inspiration_images?: string[];
  notes?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Dress code create/update
export interface DressCodeCreate {
  event_name: string;
  event_date?: string;
  description?: string;
  theme?: string;
  theme_description?: string;
  color_palette?: ColorPaletteItem[];
  dress_suggestions_men?: string;
  dress_suggestions_women?: string;
  men_suggestions?: string;
  women_suggestions?: string;
  image_urls?: string[];
  inspiration_images?: string[];
  notes?: string;
  display_order?: number;
}

export interface DressCodeUpdate {
  event_name?: string;
  event_date?: string;
  description?: string;
  theme?: string;
  theme_description?: string;
  color_palette?: ColorPaletteItem[];
  dress_suggestions_men?: string;
  dress_suggestions_women?: string;
  men_suggestions?: string;
  women_suggestions?: string;
  image_urls?: string[];
  inspiration_images?: string[];
  notes?: string;
  display_order?: number;
}

// Guest dress preference interface
export interface GuestDressPreference {
  id: string;
  guest_id: string;
  dress_code_id: string;
  planned_outfit_description?: string;
  color_choice?: string;
  needs_shopping_assistance: boolean;
  notes?: string;
}

// Guest dress preference form/update
export interface GuestDressPreferenceForm {
  dress_code_id: string;
  planned_outfit_description?: string;
  color_choice?: string;
  needs_shopping_assistance: boolean;
  notes?: string;
}

export interface GuestDressPreferenceUpdate {
  dress_code_id?: string;
  planned_outfit_description?: string;
  color_choice?: string;
  needs_shopping_assistance?: boolean;
  notes?: string;
}
