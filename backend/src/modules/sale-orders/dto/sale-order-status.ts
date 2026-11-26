/**
 * Estados posibles de una orden de venta (equivalente al state de sale.order).
 * Se mantienen como strings para no alterar el esquema existente con enums.
 */
export const SALE_ORDER_STATUSES = ['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED'] as const;

export type SaleOrderStatus = (typeof SALE_ORDER_STATUSES)[number];
