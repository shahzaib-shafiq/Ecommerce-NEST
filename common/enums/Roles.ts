export enum Role {
    ADMIN = 'ADMIN',
    STORE_OWNER='STORE_OWNER',     // Owns a store (creates products, manages orders)
  STORE_MANAGER='STORE_MANAGER',   // Manages store operations (inventory, orders)
  CUSTOMER='CUSTOMER',        // Normal user making purchases
  DELIVERY_AGENT='DELIVERY_AGENT',  // Handles shipping + order delivery
  SUPPORT_AGENT='SUPPORT_AGENT',   // Customer support (refunds, complaints)
  }
  