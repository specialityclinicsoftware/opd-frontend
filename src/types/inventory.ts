export interface InventoryItem {
  _id: string;
  hospitalId: string;
  medicineName: string;
  genericName?: string;
  manufacturer?: string;
  batchNumber: string;
  quantity: number;
  unit: string; // e.g., "tablets", "ml", "boxes"
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: Date;
  manufactureDate?: Date;
  supplier?: string;
  location?: string; // Storage location
  category?: string; // e.g., "Antibiotic", "Analgesic"
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemResponse {
  count: number;
  inventory: InventoryItem[];
  daysThreshold?: number;
}

export interface InventoryFormData {
  medicineName: string;
  genericName?: string;
  manufacturer?: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: Date;
  manufactureDate?: Date;
  supplier?: string;
  location?: string;
  category?: string;
  description?: string;
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
