import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, PlusCircle, 
  Trash2, RefreshCw, BarChart2, ListOrdered, Download, FileSpreadsheet, DollarSign, TrendingUp, TrendingDown 
} from 'lucide-react';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('ingreso');
  const [category, setCategory] = useState('General');
  const [activeTab, setActiveTab] = useState('movimientos'); // 'movimientos' o 'analisis'
  const [syncStatus, setSyncStatus] = useState('Sincronizado');

  // Cargar datos al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('control_financiero_txs');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTx = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString(),
      descripcion: description,
      monto: parseFloat(amount),
      tipo: type,
      categoria: category
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem('control_financiero_txs', JSON.stringify(updated));

    setDescription('');
    setAmount('');
    setSyncStatus('Actualizado');
  };

  const handleDelete = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('control_financiero_txs', JSON.stringify(updated));
  };

  // Función para exportar a CSV (Excel)
  const exportToExcel = () => {
    if (transactions.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,ID,Fecha,Descripcion,Tipo,Categoria,Monto\n";
    transactions.forEach(t => {
      csvContent += `${t.id},${t.fecha},"${t.descripcion}",${t.tipo},${t.categoria},${t.monto}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "control_financiero.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular totales
  const totalIngresos = transactions
    .filter(t => t.tipo === 'ingreso')
    .reduce((acc, t) => acc + Number(t.monto), 0);

  const totalGastos = transactions
    .filter(t => t.tipo === 'gasto')
    .reduce((acc, t) => acc + Number(t.monto), 0);

  const balance = totalIngresos - totalGastos;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Encabezado Principal */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet color="#2563eb" size={32} /> Control Financiero
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={exportToExcel}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
            >
              <FileSpreadsheet size={16} /> Exportar Excel
            </button>
            <span style={{ fontSize: '13px', backgroundColor: '#e2e8f0', padding: '6px 12px', borderRadius: '20px', color: '#475569' }}>
              {syncStatus}
            </span>
          </div>
        </header>

        {/* Pestañas de Navegación */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
          <button 
            onClick={() => setActiveTab('movimientos')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'movimientos' ? '#2563eb' : 'transparent', color: activeTab === 'movimientos' ? '#fff' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <ListOrdered size={18} /> Movimientos
          </button>
          <button 
            onClick={() => setActiveTab('analisis')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'analisis' ? '#2563eb' : 'transparent', color: activeTab === 'analisis' ? '#fff' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <BarChart2 size={18} /> Resumen y Análisis
          </button>
        </div>

        {/* Tarjetas de Resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={16} /> Balance Total
            </p>
            <h2 style={{ fontSize: '30px', color: balance >= 0 ? '#16a34a' : '#dc2626', margin: 0 }}>
              ${balance.toFixed(2)}
            </h2>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} color="#16a34a" /> Ingresos
            </p>
            <h2 style={{ fontSize: '26px', color: '#16a34a', margin: 0 }}>${totalIngresos.toFixed(2)}</h2>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingDown size={16} color="#dc2626" /> Gastos
            </p>
            <h2 style={{ fontSize: '26px', color: '#dc2626', margin: 0 }}>${totalGastos.toFixed(2)}</h2>
          </div>
        </div>

        {/* Contenido según la pestaña activa */}
        {activeTab === 'movimientos' ? (
          <>
            {/* Formulario para agregar */}
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="#2563eb" /> Nueva Transacción
              </h3>
              <form onSubmit={handleAddTransaction} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 120px', gap: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Descripción (ej. Venta de herramienta)" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <input 
                  type="number" 
                  placeholder="Monto ($)" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', padding: '10px' }}
                >
                  Agregar
                </button>
              </form>
            </div>

            {/* Historial de transacciones */}
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1e293b' }}>Historial de Movimientos</h3>
              {transactions.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>No hay transacciones registradas todavía.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {transactions.map((t) => (
                    <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {t.tipo === 'ingreso' ? <ArrowUpCircle color="#16a34a" size={24} /> : <ArrowDownCircle color="#dc2626" size={24} />}
                        <div>
                          <span style={{ fontWeight: '500', color: '#334155', display: 'block' }}>{t.descripcion}</span>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{t.fecha}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: t.tipo === 'ingreso' ? '#16a34a' : '#dc2626' }}>
                          {t.tipo === 'ingreso' ? '+' : '-'}${Number(t.monto).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          /* Vista de Análisis / Gráficas */
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1e293b' }}>Análisis de Rendimiento Financiero</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Resumen estadístico de tus entradas y salidas de efectivo:</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#16a34a' }}>Total Ingresos</h4>
                <p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>${totalIngresos.toFixed(2)}</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #dc2626' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Total Gastos</h4>
                <p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>${totalGastos.toFixed(2)}</p>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#334155' }}>Estado de Salud Financiera</h4>
              <p style={{ color: '#475569', margin: 0 }}>
                {balance >= 0 
                  ? '¡Excelente! Tus ingresos son superiores a tus gastos actuales.' 
                  : 'Atención: Tus gastos están superando los ingresos registrados.'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
    </div>
  );
}
