export interface Delivery {
  DeliveryID?: number;
  OrderID: number; 
  DeliveryAddress: string;
  DeliveryDate: string;
  CourierName?: string;
  CourierContact?: string;
  Status?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface DeliveryUpdate { 
  DeliveryAddress?: string;
  DeliveryDate?: string;
  CourierName?: string;
  CourierContact?: string;
  Status?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}
