import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, PlusCircle, FileSpreadsheet, 
  BarChart3, ArrowRightLeft, Search, CheckCircle2, Trash2, 
  Tag, Filter, Edit2, Save, X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('movimientos');
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('control_financiero_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Estados para nueva transacción
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Ingreso');
  const [category, setCategory] = useState('Venta de Herramientas');

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');

  // Estados para edición en línea (Campos editables)
  const [editingId, setEditingId] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('Ingreso');
  const [editCategory, setEditCategory] = useState('');

  // Guardar en almacenamiento local
  useEffect(() => {
    localStorage.setItem('control_financiero_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Agregar transacción
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

  // Eliminar transacción
  const deleteTransaction = (id) => {
    if(window.confirm('¿Estás seguro de eliminar este registro?')) {
      setTransactions(transactions.filter(tx => tx.id !== id));
    }
  };

  // Iniciar edición
  const startEdit = (tx) => {
    setEditingId(tx.id);
    setEditDesc(tx.description);
    setEditAmount(tx.amount);
    setEditType(tx.type);
    setEditCategory(tx.category);
  };

  // Guardar edición
  const saveEdit = (id) => {
    setTransactions(transactions.map(tx => 
      tx.id === id 
        ? { ...tx, description: editDesc, amount: parseFloat(editAmount), type: editType, category: editCategory }
        : tx
    ));
    setEditingId(null);
  };

  // Cálculos de Balance
  const totalIngresos = transactions.filter(tx => tx.type === 'Ingreso').reduce((acc, tx) => acc + tx.amount, 0);
  const totalGastos = transactions.filter(tx => tx.type === 'Gasto').reduce((acc, tx) => acc + tx.amount, 0);
  const balanceTotal = totalIngresos - totalGastos;

  // Filtrado
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'Todos' || tx.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Exportar a Excel
  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Fecha,Descripcion,Tipo,Categoria,Monto\n";
    transactions.forEach(tx => {
      csvContent += `${tx.id},${tx.date},"${tx.description}",${tx.type},"${tx.category}",${tx.amount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Reporte_Herramientas_JimMon.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '30px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ENCABEZADO PRINCIPAL */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: '#2563eb', padding: '12px', borderRadius: '14px', color: 'white' }}>
              <Wallet size={36} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1e293b' }}>Control Financiero</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Gestión de Ventas de Herramientas</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '24px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
              <CheckCircle2 size={18} color="#16a34a" /> Sincronizado
            </div>
            <button 
              onClick={exportToExcel}
              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)', transition: 'transform 0.1s' }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <FileSpreadsheet size={22} /> Exportar Excel
            </button>
          </div>
        </header>

        {/* TARJETAS DE BALANCE GLOBALES (Visibles en todas las pestañas) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '30px' }}>
          {/* Balance Total */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '6px solid #3b82f6' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '50%', color: '#3b82f6' }}>
              <Wallet size={40} />
            </div>
            <div>
              <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '600' }}>Balance Total Efectivo</div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: balanceTotal >= 0 ? '#0f172a' : '#ef4444' }}>
                ${balanceTotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Ingresos */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '6px solid #10b981' }}>
            <div style={{ backgroundColor: '#ecfdf5', padding: '16px', borderRadius: '50%', color: '#10b981' }}>
              <TrendingUp size={40} />
            </div>
            <div>
              <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '600' }}>Total Ingresos</div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#10b981' }}>
                ${totalIngresos.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Gastos */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '6px solid #ef4444' }}>
            <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '50%', color: '#ef4444' }}>
              <TrendingDown size={40} />
            </div>
            <div>
              <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '600' }}>Total Gastos</div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#ef4444' }}>
                ${totalGastos.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('movimientos')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'movimientos' ? '#2563eb' : '#e2e8f0', color: activeTab === 'movimientos' ? 'white' : '#475569', transition: 'all 0.2s' }}
          >
            <ArrowRightLeft size={22} /> Historial y Registros
          </button>
          <button
            onClick={() => setActiveTab('resumen')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'resumen' ? '#2563eb' : '#e2e8f0', color: activeTab === 'resumen' ? 'white' : '#475569', transition: 'all 0.2s' }}
          >
            <BarChart3 size={22} /> Análisis de Negocio
          </button>
        </div>

        {/* CONTENIDO DE PESTAÑAS */}
        {activeTab === 'movimientos' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* FORMULARIO DE NUEVO REGISTRO */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
                <PlusCircle size={26} color="#2563eb" /> Registrar Nuevo Movimiento
              </h2>
              <form onSubmit={addTransaction} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr auto', gap: '16px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Ej. Taladro, Esmeril, Dados de impacto..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ padding: '14px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none' }}
                  required
                />
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Monto ($)" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ padding: '14px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none' }}
                  required
                />
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  style={{ padding: '14px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', backgroundColor: 'white', fontWeight: 'bold', color: type === 'Ingreso' ? '#10b981' : '#ef4444' }}
                >
                  <option value="Ingreso">Ingreso (+)</option>
                  <option value="Gasto">Gasto (-)</option>
                </select>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ padding: '14px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', backgroundColor: 'white' }}
                >
                  <option value="Venta de Herramientas">Venta de Herramientas</option>
                  <option value="Entrega Metro Línea A">Entrega Metro Línea A</option>
                  <option value="Inversión en Mercancía">Inversión en Mercancía</option>
                  <option value="Publicidad FB Marketplace">Publicidad FB Marketplace</option>
                  <option value="Otros Gastos">Otros Gastos</option>
                </select>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '14px 24px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Guardar
                </button>
              </form>
            </div>

            {/* TABLA DE MOVIMIENTOS CON EDICIÓN EN LÍNEA */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#1e293b' }}>Registros Recientes</h2>
                
                {/* Filtros */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ padding: '12px 12px 12px 42px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', width: '250px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={20} color="#64748b" />
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', backgroundColor: 'white', outline: 'none', fontWeight: 'bold' }}
                    >
                      <option value="Todos">Todos los tipos</option>
                      <option value="Ingreso">Solo Ingresos</option>
                      <option value="Gasto">Solo Gastos</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '18px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  No hay transacciones que coincidan con la búsqueda.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '16px', borderRadius: '10px 0 0 10px' }}>Fecha</th>
                        <th style={{ padding: '16px' }}>Descripción</th>
                        <th style={{ padding: '16px' }}>Categoría</th>
                        <th style={{ padding: '16px' }}>Tipo</th>
                        <th style={{ padding: '16px', textAlign: 'right' }}>Monto</th>
                        <th style={{ padding: '16px', textAlign: 'center', borderRadius: '0 10px 10px 0' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', backgroundColor: editingId === tx.id ? '#eff6ff' : 'transparent' }}>
                          <td style={{ padding: '16px', color: '#64748b', fontWeight: '500' }}>{tx.date}</td>
                          
                          {/* CAMPOS EDITABLES */}
                          {editingId === tx.id ? (
                            <>
                              <td style={{ padding: '12px' }}>
                                <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                              </td>
                              <td style={{ padding: '12px' }}>
                                <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                  <option value="Venta de Herramientas">Venta de Herramientas</option>
                                  <option value="Entrega Metro Línea A">Entrega Metro Línea A</option>
                                  <option value="Inversión en Mercancía">Inversión en Mercancía</option>
                                  <option value="Publicidad FB Marketplace">Publicidad FB Marketplace</option>
                                  <option value="Otros Gastos">Otros Gastos</option>
                                </select>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <select value={editType} onChange={e => setEditType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                  <option value="Ingreso">Ingreso</option>
                                  <option value="Gasto">Gasto</option>
                                </select>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }} />
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button onClick={() => saveEdit(tx.id)} style={{ background: '#10b981', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}><Save size={16} /></button>
                                <button onClick={() => setEditingId(null)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}><X size={16} /></button>
                              </td>
                            </>
                          ) : (
                            /* VISTA NORMAL */
                            <>
                              <td style={{ padding: '16px', fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{tx.description}</td>
                              <td style={{ padding: '16px' }}>
                                <span style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                  <Tag size={14} /> {tx.category}
                                </span>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <span style={{ color: tx.type === 'Ingreso' ? '#10b981' : '#ef4444', fontWeight: '800', backgroundColor: tx.type === 'Ingreso' ? '#ecfdf5' : '#fef2f2', padding: '6px 12px', borderRadius: '8px', fontSize: '13px' }}>
                                  {tx.type}
                                </span>
                              </td>
                              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900', fontSize: '16px', color: tx.type === 'Ingreso' ? '#10b981' : '#ef4444' }}>
                                {tx.type === 'Ingreso' ? '+' : '-'}${tx.amount.toFixed(2)}
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <button onClick={() => startEdit(tx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '6px', marginRight: '8px' }} title="Editar"><Edit2 size={20} /></button>
                                <button onClick={() => deleteTransaction(tx.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px' }} title="Eliminar"><Trash2 size={20} /></button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* PESTAÑA DE RESUMEN Y ANÁLISIS */
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px', color: '#1e293b' }}>Rendimiento del Negocio</h2>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '30px' }}>Resumen estadístico de las ventas de herramientas y gastos de logística (entregas en efectivo).</p>
            
            <div style={{ backgroundColor: balanceTotal > 0 ? '#ecfdf5' : balanceTotal < 0 ? '#fef2f2' : '#f8fafc', padding: '30px', borderRadius: '12px', border: `2px solid ${balanceTotal > 0 ? '#10b981' : balanceTotal < 0 ? '#ef4444' : '#e2e8f0'}`, textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: balanceTotal > 0 ? '#047857' : balanceTotal < 0 ? '#b91c1c' : '#475569' }}>
                Diagnóstico Financiero
              </h3>
              <p style={{ color: '#334155', fontSize: '18px', margin: 0, fontWeight: '500' }}>
                {balanceTotal > 0 
                  ? '¡Excelente trabajo Jim! Tus ventas de herramientas en Marketplace están superando los gastos operativos. Tienes un flujo de caja positivo.' 
                  : balanceTotal === 0 
                  ? 'El balance está en ceros. A medida que realices entregas en Metro Línea A, aquí verás el crecimiento.' 
                  : 'Atención: Actualmente tus gastos (inversión/publicidad) superan a tus ingresos en efectivo.'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
