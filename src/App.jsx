import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Utensils, 
  Fuel, 
  Receipt, 
  Wrench, 
  RotateCcw, 
  FileSpreadsheet, 
  PlusCircle, 
  Trash2, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign
} from 'lucide-react';

const HERRAMIENTAS_FRECUENTES = [
  "Taladro Inalámbrico 18V",
  "Esmeril Angular 4-1/2",
  "Juego de Dados de Impacto",
  "Baumanómetro Digital",
  "Juego de Llaves Combinadas",
  "Bomba de Aire Portátil",
  "Pulidora Orbital",
  "Pistola para Pintar de Gravedad"
];

export default function App() {
  const [activeTab, setActiveTab] = useState('personales');

  // --- ESTADOS: GASTOS PERSONALES ---
  const [ingresoFijo, setIngresoFijo] = useState(() => {
    const saved = localStorage.getItem('personal_ingreso_fijo');
    return saved ? parseFloat(saved) : 6200;
  });
  const [personalTransactions, setPersonalTransactions] = useState(() => {
    const saved = localStorage.getItem('personal_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [customPersonalDesc, setCustomPersonalDesc] = useState('');
  const [customPersonalAmount, setCustomPersonalAmount] = useState('');
  const [customPersonalType, setCustomPersonalType] = useState('Gasto');

  // --- ESTADOS: NEGOCIO ---
  const [businessTransactions, setBusinessTransactions] = useState(() => {
    const saved = localStorage.getItem('business_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [businessDesc, setBusinessDesc] = useState('');
  const [businessAmount, setBusinessAmount] = useState('');
  const [businessType, setBusinessType] = useState('Venta');
  const [suggestions, setSuggestions] = useState([]);

  // Guardar en LocalStorage
  useEffect(() => {
    localStorage.setItem('personal_ingreso_fijo', ingresoFijo);
    localStorage.setItem('personal_transactions', JSON.stringify(personalTransactions));
  }, [ingresoFijo, personalTransactions]);

  useEffect(() => {
    localStorage.setItem('business_transactions', JSON.stringify(businessTransactions));
  }, [businessTransactions]);

  // --- ACCIONES PERSONALES ---
  const addPersonalQuick = (category, defaultAmount = 0, type = 'Gasto') => {
    const amount = defaultAmount > 0 ? defaultAmount : parseFloat(prompt(`Monto para ${category}:`, "0"));
    if (!amount || isNaN(amount)) return;

    const newTx = {
      id: Date.now(),
      description: category,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toLocaleDateString()
    };
    setPersonalTransactions([newTx, ...personalTransactions]);
  };

  const addCustomPersonal = (e) => {
    e.preventDefault();
    if (!customPersonalDesc.trim() || !customPersonalAmount || isNaN(customPersonalAmount)) return;

    const newTx = {
      id: Date.now(),
      description: customPersonalDesc.trim(),
      amount: parseFloat(customPersonalAmount),
      type: customPersonalType,
      category: 'Personal',
      date: new Date().toLocaleDateString()
    };
    setPersonalTransactions([newTx, ...personalTransactions]);
    setCustomPersonalDesc('');
    setCustomPersonalAmount('');
  };

  const deletePersonalTx = (id) => {
    setPersonalTransactions(personalTransactions.filter(tx => tx.id !== id));
  };

  const resetPersonal = () => {
    if (confirm("¿Estás seguro de reiniciar los registros de Gastos Personales?")) {
      setPersonalTransactions([]);
      setIngresoFijo(6200);
    }
  };

  // Cálculos Personales
  const totalGastosPersonales = personalTransactions
    .filter(tx => tx.type === 'Gasto')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalIngresosPersonalesAdicionales = personalTransactions
    .filter(tx => tx.type === 'Ingreso')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balancePersonal = (ingresoFijo + totalIngresosPersonalesAdicionales) - totalGastosPersonales;

  // --- ACCIONES NEGOCIO ---
  const handleBusinessDescChange = (e) => {
    const value = e.target.value;
    setBusinessDesc(value);
    if (value.trim().length >= 1) {
      const filtered = HERRAMIENTAS_FRECUENTES.filter(item => 
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (item) => {
    setBusinessDesc(item);
    setSuggestions([]);
  };

  const addBusinessTransaction = (e) => {
    e.preventDefault();
    if (!businessDesc.trim() || !businessAmount || isNaN(businessAmount)) return;

    const newTx = {
      id: Date.now(),
      description: businessDesc.trim(),
      amount: parseFloat(businessAmount),
      type: businessType, // Venta, Reinversión, Gasto Negocio
      date: new Date().toLocaleDateString()
    };
    setBusinessTransactions([newTx, ...businessTransactions]);
    setBusinessDesc('');
    setBusinessAmount('');
    setSuggestions([]);
  };

  const deleteBusinessTx = (id) => {
    setBusinessTransactions(businessTransactions.filter(tx => tx.id !== id));
  };

  const resetBusiness = () => {
    if (confirm("¿Estás seguro de reiniciar los registros del Negocio?")) {
      setBusinessTransactions([]);
    }
  };

  // Cálculos Negocio
  const totalVentas = businessTransactions
    .filter(tx => tx.type === 'Venta')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalReinversion = businessTransactions
    .filter(tx => tx.type === 'Reinversión')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalGastosNegocio = businessTransactions
    .filter(tx => tx.type === 'Gasto Negocio')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balanceNegocio = totalVentas - (totalReinversion + totalGastosNegocio);

  // --- EXPORTAR A EXCEL ---
  const exportToExcel = (tipo) => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Fecha,Descripcion,Tipo,Monto\n";
    const data = tipo === 'personal' ? personalTransactions : businessTransactions;
    
    data.forEach(tx => {
      csvContent += `${tx.id},${tx.date},"${tx.description}",${tx.type},${tx.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `control_${tipo}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Encabezado Principal */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#2563eb' }}>
              <Wallet size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Control Financiero Integral</h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Gastos Personales y Gestión de Negocio</p>
            </div>
          </div>
        </header>

        {/* Pestañas Principales */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('personales')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'personales' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'personales' ? 'white' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Wallet size={18} /> Gastos Personales
          </button>
          <button
            onClick={() => setActiveTab('negocio')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'negocio' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'negocio' ? 'white' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Wrench size={18} /> Negocio de Herramientas
          </button>
        </div>

        {/* =================================================== */}
        {/* PESTAÑA 1: GASTOS PERSONALES                        */}
        {/* =================================================== */}
        {activeTab === 'personales' && (
          <div>
            {/* Barra de Acciones y Balance */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Ingreso Fijo Base</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={18} color="#16a34a" />
                  <input 
                    type="number" 
                    value={ingresoFijo} 
                    onChange={(e) => setIngresoFijo(parseFloat(e.target.value) || 0)}
                    style={{ fontSize: '20px', fontWeight: 'bold', width: '120px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px' }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Total Gastos Personales</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>${totalGastosPersonales.toFixed(2)}</div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Balance Personal Disponible</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: balancePersonal >= 0 ? '#16a34a' : '#dc2626' }}>
                  ${balancePersonal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Iconos de un solo toque para gastos rápidos */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Registro Rápido por Categoría (Clic para capturar monto)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <button 
                  onClick={() => addPersonalQuick('Supermercado')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <ShoppingBag size={24} color="#16a34a" />
                  <span style={{ fontWeight: '600', color: '#166534' }}>Supermercado</span>
                </button>
                <button 
                  onClick={() => addPersonalQuick('Comida')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <Utensils size={24} color="#2563eb" />
                  <span style={{ fontWeight: '600', color: '#1e40af' }}>Comida</span>
                </button>
                <button 
                  onClick={() => addPersonalQuick('Gasolina')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <Fuel size={24} color="#ea580c" />
                  <span style={{ fontWeight: '600', color: '#9a3412' }}>Gasolina</span>
                </button>
                <button 
                  onClick={() => addPersonalQuick('Otros Gastos')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <Receipt size={24} color="#dc2626" />
                  <span style={{ fontWeight: '600', color: '#991b1b' }}>Otros Gastos</span>
                </button>
              </div>
            </div>

            {/* Historial y Acciones de Pestaña */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Historial - Gastos Personales</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => exportToExcel('personal')}
                    style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileSpreadsheet size={16} /> Exportar Excel
                  </button>
                  <button 
                    onClick={resetPersonal}
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={16} /> Reiniciar Pestaña
                  </button>
                </div>
              </div>

              {personalTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay movimientos personales registrados.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                      <th style={{ padding: '10px' }}>Fecha</th>
                      <th style={{ padding: '10px' }}>Concepto</th>
                      <th style={{ padding: '10px' }}>Tipo</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Monto</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalTransactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '10px', color: '#64748b' }}>{tx.date}</td>
                        <td style={{ padding: '10px', fontWeight: '500' }}>{tx.description}</td>
                        <td style={{ padding: '10px', color: tx.type === 'Ingreso' ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{tx.type}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: tx.type === 'Ingreso' ? '#16a34a' : '#dc2626' }}>
                          {tx.type === 'Ingreso' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button onClick={() => deletePersonalTx(tx.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* PESTAÑA 2: NEGOCIO DE HERRAMIENTAS                  */}
        {/* =================================================== */}
        {activeTab === 'negocio' && (
          <div>
            {/* Resumen Negocio */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Total Ventas</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>${totalVentas.toFixed(2)}</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Reinversión y Gastos</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>${(totalReinversion + totalGastosNegocio).toFixed(2)}</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Balance Neto del Negocio</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: balanceNegocio >= 0 ? '#16a34a' : '#dc2626' }}>${balanceNegocio.toFixed(2)}</div>
              </div>
            </div>

            {/* Formulario con Autocompletado */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="#2563eb" /> Registrar Movimiento de Negocio
              </h2>
              
              <form onSubmit={addBusinessTransaction} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr auto', gap: '12px', alignItems: 'center', position: 'relative' }}>
                
                {/* Campo con Autocompletado */}
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Concepto (escribe 3 letras...)" 
                    value={businessDesc}
                    onChange={handleBusinessDescChange}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                    required
                  />
                  {suggestions.length > 0 && (
                    <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', listStyle: 'none', margin: '4px 0 0 0', padding: 0, zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      {suggestions.map((item, idx) => (
                        <li 
                          key={idx} 
                          onClick={() => selectSuggestion(item)}
                          style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: idx < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '14px' }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Monto ($)" 
                  value={businessAmount}
                  onChange={(e) => setBusinessAmount(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  required
                />

                <select 
                  value={businessType} 
                  onChange={(e) => setBusinessType(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white', outline: 'none' }}
                >
                  <option value="Venta">Venta</option>
                  <option value="Reinversión">Reinversión</option>
                  <option value="Gasto Negocio">Gasto Negocio</option>
                </select>

                <button 
                  type="submit" 
                  style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Agregar
                </button>
              </form>
            </div>

            {/* Historial del Negocio */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Historial - Negocio de Herramientas</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => exportToExcel('negocio')}
                    style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileSpreadsheet size={16} /> Exportar Excel
                  </button>
                  <button 
                    onClick={resetBusiness}
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={16} /> Reiniciar Pestaña
                  </button>
                </div>
              </div>

              {businessTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay registros en el negocio todavía.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                      <th style={{ padding: '10px' }}>Fecha</th>
                      <th style={{ padding: '10px' }}>Concepto</th>
                      <th style={{ padding: '10px' }}>Tipo</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Monto</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessTransactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '10px', color: '#64748b' }}>{tx.date}</td>
                        <td style={{ padding: '10px', fontWeight: '500' }}>{tx.description}</td>
                        <td style={{ padding: '10px', color: tx.type === 'Venta' ? '#16a34a' : '#ea580c', fontWeight: '600' }}>{tx.type}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: tx.type === 'Venta' ? '#16a34a' : '#ea580c' }}>
                          {tx.type === 'Venta' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button onClick={() => deleteBusinessTx(tx.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
