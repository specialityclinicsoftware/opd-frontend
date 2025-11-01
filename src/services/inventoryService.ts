import apiClient from './api';
import type {
  InventoryItem,
  InventoryFormData,
  InventoryStats,
  QuantityUpdate,
  ApiResponse,
  InventoryItemResponse,
} from '../types';

const inventoryService = {
  // Create new inventory item
  create: async (
    hospitalId: string,
    data: InventoryFormData
  ): Promise<ApiResponse<InventoryItem>> => {
    const response = await apiClient.post(`/api/inventory`, { ...data, hospitalId });
    return {
      success: response.data.success,
      message: response.data.message || 'Inventory item added successfully',
      data: response.data.data,
    };
  },

  // Get all inventory for a hospital with optional search
  getByHospital: async (
    hospitalId: string,
    search?: string
  ): Promise<ApiResponse<InventoryItemResponse>> => {
    const params = search ? { search } : {};
    const response = await apiClient.get(`/api/inventory/hospital/${hospitalId}`, { params });

    return {
      success: response.data.success,
      message: response.data.message || 'Inventory fetched successfully',
      data: response.data.data || [],
    };
  },

  // Get low stock items with optional search
  getLowStock: async (
    hospitalId: string,
    search?: string
  ): Promise<ApiResponse<InventoryItemResponse>> => {
    const params = search ? { search } : {};
    const response = await apiClient.get(`/api/inventory/hospital/${hospitalId}/low-stock`, {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message || 'Low stock items fetched successfully',
      data: response.data.data || [],
    };
  },

  // Get expiring items with optional search
  getExpiring: async (
    hospitalId: string,
    search?: string
  ): Promise<ApiResponse<InventoryItemResponse>> => {
    const params = search ? { search } : {};
    const response = await apiClient.get(`/api/inventory/hospital/${hospitalId}/expiring`, {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message || 'Expiring items fetched successfully',
      data: response.data.data || [],
    };
  },

  // Get inventory stats
  getStats: async (hospitalId: string): Promise<ApiResponse<InventoryStats>> => {
    const response = await apiClient.get(`/api/inventory/hospital/${hospitalId}/stats`);

    return {
      success: response.data.success,
      message: response.data.message || 'Stats fetched successfully',
      data: response.data.data,
    };
  },

  // Get single inventory item
  getById: async (id: string): Promise<ApiResponse<InventoryItem>> => {
    const response = await apiClient.get(`/api/inventory/${id}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Item fetched successfully',
      data: response.data.data,
    };
  },

  // Update inventory item
  update: async (
    id: string,
    data: Partial<InventoryFormData>
  ): Promise<ApiResponse<InventoryItem>> => {
    const response = await apiClient.put(`/api/inventory/${id}`, data);
    return {
      success: response.data.success,
      message: response.data.message || 'Item updated successfully',
      data: response.data.data,
    };
  },

  // Update item quantity
  updateQuantity: async (
    id: string,
    update: QuantityUpdate
  ): Promise<ApiResponse<InventoryItem>> => {
    const response = await apiClient.patch(`/api/inventory/${id}/quantity`, update);
    return {
      success: response.data.success,
      message: response.data.message || 'Quantity updated successfully',
      data: response.data.data,
    };
  },

  // Delete inventory item
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/api/inventory/${id}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Item deleted successfully',
      data: null,
    };
  },
};

export default inventoryService;
