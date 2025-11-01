export interface InventoryItem {
  _id: string;
  hospitalId: string;
  itemName: string;
  genericName?: string;
  manufacturer?: string;
  batchNumber: string;
  quantity: number;
  unit: string; // e.g., "tablets", "ml", "boxes"
  minStockLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  mrp?: number; // Maximum Retail Price
  expiryDate: Date;
  location?: string; // Storage location
  category?: string; // e.g., "tablet", "capsule", "syrup"
  description?: string;
  notes?: string; // Additional notes
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemResponse {
  count: number;
  inventory: InventoryItem[];
  daysThreshold?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InventoryFormData {
  itemName: string;
  genericName?: string;
  manufacturer?: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  mrp?: number;
  expiryDate: Date;
  location?: string;
  category?: string;
  description?: string;
  notes?: string;
}

export interface CategoryCounts {
  tablet: number;
  capsule: number;
  syrup: number;
  injection: number;
  ointment: number;
  drops: number;
  inhaler: number;
  suspension: number;
}

export interface InventoryStats {
  totalItems: number;
  activeItems: number;
  lowStockCount: number;
  expiredCount: number;
  totalValue: number;
  categoryCounts: CategoryCounts;
}

export interface QuantityUpdate {
  quantity: number;
  operation: 'add' | 'subtract' | 'set';
}
