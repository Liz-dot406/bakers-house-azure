export interface Delivery {
  DeliveryID?: number;          
  Order_id: number;
  DeliveryAddress: string;
  DeliveryDate: string;
  CourierName?: string;
  CourierContact?: string;
  Status?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}
