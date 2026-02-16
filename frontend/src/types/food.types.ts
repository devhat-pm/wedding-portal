// Dietary option type
export type DietaryOption =
  | 'vegetarian'
  | 'vegan'
  | 'halal'
  | 'gluten_free'
  | 'nut_free'
  | 'dairy_free';

// Menu item interface
export interface MenuItem {
  name: string;
  description?: string;
  category?: string;
}

// Menu item category (legacy - for backwards compatibility)
export interface MenuItemCategory {
  [category: string]: string[];
}

// Meal size preference enum
export enum MealSizePreference {
  SMALL = 'small',
  REGULAR = 'regular',
  LARGE = 'large',
}

// Food menu interface
export interface FoodMenu {
  id: string;
  wedding_id: string;
  event_name: string;
  menu_items?: Record<string, string[]> | MenuItem[];
  dietary_options_available?: string[];
  dietary_options?: DietaryOption[];
  notes?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Food menu create/update
export interface FoodMenuCreate {
  event_name: string;
  menu_items?: MenuItem[];
  dietary_options?: DietaryOption[];
  notes?: string;
  display_order?: number;
}

export interface FoodMenuUpdate {
  event_name?: string;
  menu_items?: MenuItem[];
  dietary_options?: DietaryOption[];
  notes?: string;
  display_order?: number;
}

// Guest food preference interface
export interface GuestFoodPreference {
  id: string;
  guest_id: string;
  dietary_restrictions?: string[];
  allergies?: string;
  cuisine_preferences?: string;
  special_requests?: string;
  meal_size_preference?: MealSizePreference | string;
}

// Guest food preference form/update
export interface GuestFoodPreferenceForm {
  dietary_restrictions?: string[];
  allergies?: string;
  cuisine_preferences?: string;
  special_requests?: string;
  meal_size_preference?: string;
}

export interface GuestFoodPreferenceUpdate {
  dietary_restrictions?: string[];
  allergies?: string;
  cuisine_preferences?: string;
  special_requests?: string;
  meal_size_preference?: string;
}
