import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { API_URL } = useContext(AuthContext);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error al cargar stats:", err);
      }
    };
    fetchStats();
  }, [API_URL]);

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const statCards = [
    { name: 'Ingresos Totales', value: `$${stats.totalVentas.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Pedidos Totales', value: stats.totalPedidos, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Clientes Registrados', value: stats.totalClientes, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Inventario Activo', value: stats.totalProductos, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' }
  ];

  const labels = stats.ventasRecientes.map(item => item.fecha_corta);
  const dataValues = stats.ventasRecientes.map(item => parseFloat(item.diario).toFixed(2));

  const data = {
    labels,
    datasets: [
      {
        label: 'Ventas Diarias ($)',
        data: dataValues,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#7c3aed',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false, padding: 12, backgroundColor: '#1e293b', titleFont: { size: 13 }, bodyFont: { size: 14, weight: 'bold' } }
    },
    scales: {
      y: { border: { display: false }, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { padding: 10, color: '#64748b' } },
      x: { border: { display: false }, grid: { display: false }, ticks: { color: '#64748b' } }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-inner`}>
                   <Icon className="w-6 h-6" strokeWidth={2.5} />
                 </div>
                 <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                 </div>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                <p className="text-sm font-semibold tracking-wide text-gray-500 mt-1 uppercase">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
           Flujo de Ingresos (Últimos 7 días)
        </h3>
        <div className="relative h-96 w-full">
           {stats.ventasRecientes.length > 0 ? (
             <Line options={options} data={data} />
           ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <DollarSign className="w-12 h-12 text-gray-300 mb-2" />
               <span className="text-gray-500 font-semibold">Esperando primeras ventas...</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
