import { apiClient } from "../api-client"

export interface AddressResponse {
    id: string
    recipientName: string
    phoneNumber: string
    street: string
    ward: string
    district: string
    province: string
    latitude: number
    longitude: number
    provinceId: number
    districtId: number
    wardCode: string
}
export type Address = AddressResponse;

export interface CreateAddressRequest {
    recipientName: string
    phoneNumber: string
    street: string
    ward: string
    district: string
    province: string
    latitude?: number
    longitude?: number
    provinceId: number
    districtId: number
    wardCode: string
}

export interface UpdateAddressRequest {
    recipientName?: string
    phoneNumber?: string
    street?: string
    ward?: string
    district?: string
    province?: string
    latitude?: number
    longitude?: number
    provinceId?: number
    districtId?: number
    wardCode?: string
}

export const addressService = {
    /**
     * Create a new address
     * POST /api/addresses
     */
    async createAddress(data: CreateAddressRequest): Promise<AddressResponse> {
        return apiClient.post<AddressResponse>("/addresses", data)
    },

    /**
     * Update an address
     * PUT /api/addresses/{id}
     */
    async updateAddress(id: string, data: UpdateAddressRequest): Promise<AddressResponse> {
        return apiClient.put<AddressResponse>(`/addresses/${id}`, data)
    },

    /**
     * Delete an address
     * DELETE /api/addresses/{id}
     */
    async deleteAddress(id: string): Promise<void> {
        return apiClient.delete<void>(`/addresses/${id}`)
    },

    /**
     * Get address by ID
     * GET /api/addresses/{id}
     */
    async getAddressById(id: string): Promise<AddressResponse> {
        return apiClient.get<AddressResponse>(`/addresses/${id}`)
    },

    /**
     * Get all addresses of current user
     * GET /api/addresses/user
     */
    async getUserAddresses(): Promise<AddressResponse[]> {
        return apiClient.get<AddressResponse[]>("/addresses/user")
    },
}
