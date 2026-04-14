const statusColors: Record<string, string> = {
  PENDING: 'badge-yellow',
  PAID: 'badge-green',
  SHIPPED: 'badge-blue',
  COMPLETED: 'badge-green',
  CANCELLED: 'badge-red',
  FAILED: 'badge-red',
  REFUNDED: 'badge-gray',
  IN_TRANSIT: 'badge-blue',
  OUT_FOR_DELIVERY: 'badge-blue',
  DELIVERED: 'badge-green',
  RETURNED: 'badge-red',
  ACTIVE: 'badge-green',
  INACTIVE: 'badge-gray',
};

export default function StatusBadge({ status }: { status: string }) {
  const colorClass = statusColors[status] || 'badge-gray';
  return <span className={colorClass}>{status.replace(/_/g, ' ')}</span>;
}
