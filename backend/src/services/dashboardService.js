const dashboardRepository = require('../repositories/dashboardRepository');

exports.getDashboardStats = async () => {
  const salesAndOrders = await dashboardRepository.getTotalSalesAndOrders();
  const totalVentas = parseFloat(salesAndOrders.total_ventas) || 0;
  const totalPedidos = parseInt(salesAndOrders.total_pedidos) || 0;
  
  const totalClientes = await dashboardRepository.getTotalCustomers();
  const totalProductos = await dashboardRepository.getTotalProducts();
  
  const ventasRecientesRow = await dashboardRepository.getRecentSales();
  const topProductsRow = await dashboardRepository.getTopProducts();

  const ticketPromedio = totalPedidos > 0 ? (totalVentas / totalPedidos) : 0;

  return {
    totalVentas,
    totalPedidos,
    ticketPromedio,
    totalClientes,
    totalProductos,
    ventasRecientes: ventasRecientesRow.reverse(), // Orden cronológico
    topProducts: topProductsRow
  };
};
