export interface Category {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
}

export interface Menu {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_popular: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuDetail extends Menu {
  option_groups: OptionGroupWithItems[];
}

export interface OptionGroup {
  id: string;
  store_id: string;
  name: string;
  is_required: boolean;
  created_at: string;
}

export interface OptionItem {
  id: string;
  option_group_id: string;
  name: string;
  extra_price: number;
  sort_order: number;
}

export interface OptionGroupWithItems extends OptionGroup {
  items: OptionItem[];
}

export interface MenusByCategory {
  category: Category;
  menus: Menu[];
}

export interface CreateMenuRequest {
  category_id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

export interface UpdateMenuRequest {
  category_id?: string;
  name?: string;
  price?: number;
  description?: string;
  image_url?: string;
  is_popular?: boolean;
  is_available?: boolean;
}

export interface ReorderMenusRequest {
  menu_ids: string[];
}

export interface CreateOptionGroupRequest {
  name: string;
  is_required: boolean;
  items: CreateOptionItemRequest[];
}

export interface CreateOptionItemRequest {
  name: string;
  extra_price: number;
  sort_order?: number;
}

export interface UpdateOptionGroupRequest {
  name?: string;
  is_required?: boolean;
  items?: CreateOptionItemRequest[];
}
