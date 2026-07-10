function canCancelOrder(order = {}, now = new Date()) {
  const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
  if (!createdAt || Number.isNaN(createdAt.getTime())) return false;

  const cutoff = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  return now.getTime() <= cutoff.getTime();
}

module.exports = { canCancelOrder };
