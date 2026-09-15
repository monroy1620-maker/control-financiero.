import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  FileSpreadsheet, 
  BarChart3, 
  ArrowRightLeft, 
  Search, 
  CheckCircle2, 
  Trash2, 
  Tag, 
  Filter 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('movimientos');
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('control_financiero_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Ingreso');
  const [category, setCategory] = useState('Venta de Herramientas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');

  useEffect(() => {
    localStorage.setItem('control_financiero_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || isNaN(amount)) return;

    const newTx = {
      id: Date.now(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toLocaleDateString()
    };

    setTransactions([newTx, ...transactions]);
    setDescription('');
    setAmount('');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(tx => tx.id !== id));
  };

  const totalIngresos = transactions
    .filter(tx => tx.type === 'Ingreso')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalGastos = transactions
    .filter(tx => tx.type === 'Gasto')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balanceTotal = totalIngresos - totalGastos;

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'Todos' || tx.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Fecha,Descripcion,Tipo,Categoria,Monto\n";
    transactions.forEach(tx => {
      csvContent += `${tx.id},${tx.date},"${tx.description}",${tx.type},"${tx.category}",${tx.amount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "control_financiero.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Encabezado */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#2563eb' }}>
              <Wallet size={28} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Control Financiero</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={exportToExcel}
              style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <FileSpreadsheet size={18} /> Exportar Excel
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
              <CheckCircle2 size={14} color="#16a34a" /> Sincronizado
            </div>
          </div>
        </header>

        {/* Pestañas de navegación */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('movimientos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'movimientos' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'movimientos' ? 'white' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            <ArrowRightLeft size={18} /> Movimientos
          </button>
          <button
            onClick={() => setActiveTab('resumen')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'resumen' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'resumen' ? 'white' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            <BarChart3 size={18} /> Resumen y Análisis
          </button>
        </div>

        {/* Tarjetas de Resumen Global */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Wallet size={16} /> Balance Total
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: balanceTotal >= 0 ? '#16a34a' : '#dc2626' }}>
              ${balanceTotal.toFixed(2)}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <TrendingUp size={16} color="#16a34a" /> Ingresos
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>
              ${totalIngresos.toFixed(2)}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <TrendingDown size={16} color="#dc2626" /> Gastos
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>
              ${totalGastos.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Contenido según la pestaña activa */}
        {activeTab === 'movimientos' ? (
          <>
            {/* Formulario Nueva Transacción */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="#2563eb" /> Nueva Transacción
              </h2>
              <form onSubmit={addTransaction} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr auto', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Descripción (ej. Taladro / Entrega Metro A)" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  required
                />
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Monto ($)" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  required
                />
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white', outline: 'none' }}
                >
                  <option value="Ingreso">Ingreso</option>
                  <option value="Gasto">Gasto</option>
                </select>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white', outline: 'none' }}
                >
                  <option value="Venta de Herramientas">Venta de Herramientas</option>
                  <option value="Entrega Metro A">Entrega Metro A</option>
                  <option value="Inversión / Stock">Inversión / Stock</option>
                  <option value="Otros">Otros</option>
                </select>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  Agregar
                </button>
              </form>
            </div>

            {/* Historial de Movimientos y Filtros */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Historial de Movimientos</h2>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input 
                      type="text" 
                      placeholder="Buscar movimiento..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', width: '200px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Filter size={16} color="#64748b" />
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white', outline: 'none' }}
                    >
                      <option value="Todos">Todos</option>
                      <option value="Ingreso">Ingresos</option>
                      <option value="Gasto">Gastos</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No hay transacciones registradas con los filtros actuales.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                        <th style={{ padding: '12px' }}>Fecha</th>
                        <th style={{ padding: '12px' }}>Descripción</th>
                        <th style={{ padding: '12px' }}>Categoría</th>
                        <th style={{ padding: '12px' }}>Tipo</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Monto</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                          <td style={{ padding: '12px', color: '#64748b' }}>{tx.date}</td>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{tx.description}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Tag size={12} /> {tx.category}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ color: tx.type === 'Ingreso' ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                              {tx.type}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: tx.type === 'Ingreso' ? '#16a34a' : '#dc2626' }}>
                            {tx.type === 'Ingreso' ? '+' : '-'}${tx.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button 
                              onClick={() => deleteTransaction(tx.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                              title="Eliminar transacción"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Pestaña de Resumen y Análisis */
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Análisis de Rendimiento Financiero</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Resumen estadístico de tus entradas y salidas de efectivo:</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Total Ingresos</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>${totalIngresos.toFixed(2)}</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #dc2626' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Total Gastos</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>${totalGastos.toFixed(2)}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Estado de Salud Financiera</h3>
              <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
                {balanceTotal > 0 
                  ? '¡Excelente! Tus ingresos son superiores a tus gastos actuales.' 
                  : balanceTotal === 0 
                  ? 'Tus finanzas están en ceros. Comienza a registrar tus ventas y gastos.' 
                  : 'Atención: Tus gastos superan a tus ingresos en este periodo.'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
