import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Utensils, 
  Fuel, 
  Receipt, 
  Wrench, 
  RotateCcw, 
  FileSpreadsheet, 
  Trash2, 
  Wallet, 
  TrendingUp, 
  DollarSign,
  Calendar
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

  // --- CONTROL DE FECHAS (MES Y AÑO SELECCIONADO) ---
  const fechaActual = new Date();
  const [selectedMonth, setSelectedMonth] = useState(fechaActual.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(fechaActual.getFullYear());

  // --- ESTADOS: GASTOS PERSONALES ---
  const [ingresoFijo, setIngresoFijo] = useState(() => {
    const saved = localStorage.getItem('personal_ingreso_fijo');
    return saved ? parseFloat(saved) : 6200;
  });
  const [personalTransactions, setPersonalTransactions] = useState(() => {
    const saved = localStorage.getItem('personal_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // --- ESTADOS: NEGOCIO ---
  const [businessTransactions, setBusinessTransactions] = useState(() => {
    const saved = localStorage.getItem('business_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Guardar en LocalStorage
  useEffect(() => {
    localStorage.setItem('personal_ingreso_fijo', ingresoFijo);
    localStorage.setItem('personal_transactions', JSON.stringify(personalTransactions));
  }, [ingresoFijo, personalTransactions]);

  useEffect(() => {
    localStorage.setItem('business_transactions', JSON.stringify(businessTransactions));
  }, [businessTransactions]);

  const getFormattedDateISO = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- ACCIONES PERSONALES ---
  const addPersonalQuick = (category) => {
    let finalCategory = category;

    if (category === 'Otros Gastos') {
      const customConcept = prompt("Ingresa el concepto de este gasto:", "");
      if (customConcept === null || !customConcept.trim()) return;
      finalCategory = customConcept.trim();
    }

    const amountStr = prompt(`Ingresa el monto para ${finalCategory}:`, "");
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (!amount || isNaN(amount)) {
      alert("Monto inválido.");
      return;
    }

    const newTx = {
      id: Date.now(),
      description: finalCategory,
      amount: parseFloat(amount),
      type: 'Gasto',
      category: category === 'Otros Gastos' ? 'Otros' : category,
      date: new Date().toLocaleDateString(),
      isoDate: getFormattedDateISO()
    };
    setPersonalTransactions([newTx, ...personalTransactions]);
  };

  const editPersonalTx = (id, field, currentValue) => {
    if (field === 'description') {
      const newDesc = prompt("Edita el concepto:", currentValue);
      if (newDesc === null || !newDesc.trim()) return;
      setPersonalTransactions(personalTransactions.map(tx => tx.id === id ? { ...tx, description: newDesc.trim() } : tx));
    } else if (field === 'amount') {
      const newAmountStr = prompt("Edita el monto:", currentValue);
      if (newAmountStr === null) return;
      const newAmount = parseFloat(newAmountStr);
      if (isNaN(newAmount)) {
        alert("Monto inválido.");
        return;
      }
      setPersonalTransactions(personalTransactions.map(tx => tx.id === id ? { ...tx, amount: newAmount } : tx));
    }
  };

  const deletePersonalTx = (id) => {
    setPersonalTransactions(personalTransactions.filter(tx => tx.id !== id));
  };

  const resetPersonalCurrentMonth = () => {
    if (confirm(`¿Estás seguro de reiniciar los registros personales de este mes (${selectedMonth}/${selectedYear})?`)) {
      setPersonalTransactions(personalTransactions.filter(tx => {
        if (!tx.isoDate) return true;
        const [y, m] = tx.isoDate.split('-');
        return !(parseInt(y) === selectedYear && parseInt(m) === selectedMonth);
      }));
    }
  };

  // --- ACCIONES NEGOCIO ---
  const addBusinessAction = (type) => {
    const amountStr = prompt(`Ingresa el monto para ${type}:`, "");
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (!amount || isNaN(amount)) {
      alert("Monto inválido.");
      return;
    }

    let concepto = prompt(`Ingresa el concepto o herramienta para ${type} (Sugerencias: Taladro, Esmeril, Dados, Baumanómetro, Llaves, Bomba, Pulidora, Pistola):`, "");
    if (concepto === null || !concepto.trim()) return;

    concepto = concepto.trim();
    const coincidencia = HERRAMIENTAS_FRECUENTES.find(item => 
      item.toLowerCase().includes(concepto.toLowerCase())
    );
    const descripcionFinal = coincidencia ? coincidencia : concepto;

    const newTx = {
      id: Date.now(),
      description: descripcionFinal,
      amount: parseFloat(amount),
      type: type,
      date: new Date().toLocaleDateString(),
      isoDate: getFormattedDateISO()
    };
    setBusinessTransactions([newTx, ...businessTransactions]);
  };

  const editBusinessTx = (id, field, currentValue) => {
    if (field === 'description') {
      const newDesc = prompt("Edita el concepto o herramienta:", currentValue);
      if (newDesc === null || !newDesc.trim()) return;
      setBusinessTransactions(businessTransactions.map(tx => tx.id === id ? { ...tx, description: newDesc.trim() } : tx));
    } else if (field === 'amount') {
      const newAmountStr = prompt("Edita el monto:", currentValue);
      if (newAmountStr === null) return;
      const newAmount = parseFloat(newAmountStr);
      if (isNaN(newAmount)) {
        alert("Monto inválido.");
        return;
      }
      setBusinessTransactions(businessTransactions.map(tx => tx.id === id ? { ...tx, amount: newAmount } : tx));
    }
  };

  const deleteBusinessTx = (id) => {
    setBusinessTransactions(businessTransactions.filter(tx => tx.id !== id));
  };

  const resetBusinessCurrentMonth = () => {
    if (confirm(`¿Estás seguro de reiniciar los registros del negocio de este mes (${selectedMonth}/${selectedYear})?`)) {
      setBusinessTransactions(businessTransactions.filter(tx => {
        if (!tx.isoDate) return true;
        const [y, m] = tx.isoDate.split('-');
        return !(parseInt(y) === selectedYear && parseInt(m) === selectedMonth);
      }));
    }
  };

  // --- FILTRADO ---
  const filterBySelectedPeriod = (tx) => {
    if (!tx.isoDate) return true;
    const [y, m] = tx.isoDate.split('-');
    return parseInt(y) === selectedYear && parseInt(m) === selectedMonth;
  };

  const filterBySelectedYear = (tx) => {
    if (!tx.isoDate) return true;
    const [y] = tx.isoDate.split('-');
    return parseInt(y) === selectedYear;
  };

  const filteredPersonalTransactions = personalTransactions.filter(filterBySelectedPeriod);
  const filteredBusinessTransactions = businessTransactions.filter(filterBySelectedPeriod);

  // Cálculos Personales
  const totalGastosPersonales = filteredPersonalTransactions
    .filter(tx => tx.type === 'Gasto')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalIngresosPersonalesAdicionales = filteredPersonalTransactions
    .filter(tx => tx.type === 'Ingreso')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balancePersonal = (ingresoFijo + totalIngresosPersonalesAdicionales) - totalGastosPersonales;

  // Cálculos Negocio
  const totalVentas = filteredBusinessTransactions
    .filter(tx => tx.type === 'Venta')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalReinversion = filteredBusinessTransactions
    .filter(tx => tx.type === 'Reinversión')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalGastosNegocio = filteredBusinessTransactions
    .filter(tx => tx.type === 'Gasto Negocio')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balanceNegocio = totalVentas - (totalReinversion + totalGastosNegocio);

  // --- EXPORTAR A EXCEL ---
  const exportToExcel = (tipo, alcance) => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Fecha,Descripcion,Tipo,Monto\n";
    let data = tipo === 'personal' ? personalTransactions : businessTransactions;
    
    if (alcance === 'mes') {
      data = data.filter(filterBySelectedPeriod);
    } else {
      data = data.filter(filterBySelectedYear);
    }
    
    data.forEach(tx => {
      csvContent += `${tx.id},${tx.date},"${tx.description}",${tx.type},${tx.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sufijo = alcance === 'mes' ? `mes_${selectedMonth}_${selectedYear}` : `anual_${selectedYear}`;
    link.setAttribute("download", `control_${tipo}_${sufijo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mesesNombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Encabezado y Selector */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#2563eb' }}>
              <Wallet size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Control Financiero Integral</h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Historial y Balances Mensuales</p>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '10px 16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar color="#2563eb" size={18} />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', fontWeight: '500', background: 'white' }}
            >
              {mesesNombres.map((mes, index) => (
                <option key={index + 1} value={index + 1}>{mes}</option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', fontWeight: '500', background: 'white' }}
            >
              {[2025, 2026, 2027, 2028].map((anio) => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Pestañas */}
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
              fontSize: '16px'
            }}
          >
            <Wallet size={20} /> Gastos Personales
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
              fontSize: '16px'
            }}
          >
            <Wrench size={20} /> Negocio de Herramientas
          </button>
        </div>

        {/* PESTAÑA 1: PERSONALES */}
        {activeTab === 'personales' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Ingreso Fijo Base</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign color="#16a34a" size={18} />
                  <input 
                    type="number" 
                    value={ingresoFijo} 
                    onChange={(e) => setIngresoFijo(parseFloat(e.target.value) || 0)}
                    style={{ fontSize: '20px', fontWeight: 'bold', width: '120px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px' }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Gastos Personales ({mesesNombres[selectedMonth - 1]})</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>${totalGastosPersonales.toFixed(2)}</div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Balance Personal Disponible</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: balancePersonal >= 0 ? '#16a34a' : '#dc2626' }}>
                  ${balancePersonal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Accesos Rápidos Personales */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Registro Rápido ({mesesNombres[selectedMonth - 1]} {selectedYear})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <button 
                  onClick={() => addPersonalQuick('Supermercado')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <ShoppingBag color="#16a34a" size={36} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#166534' }}>Supermercado</span>
                </button>
                <button 
                  onClick={() => addPersonalQuick('Comida')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <Utensils color="#2563eb" size={36} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e40af' }}>Comida</span>
                </button>
                <button 
                  onClick={() => addPersonalQuick('Gasolina')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', backgroundColor: '#fff7ed', border: '2px solid #fed7aa', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <Fuel color="#ea580c" size={36} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#9a3412' }}>Gasolina</span>
                </button>
                <button 
                  onClick={() => addPersonalQuick('Otros Gastos')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <Receipt color="#dc2626" size={36} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#991b1b' }}>Otros Gastos</span>
                </button>
              </div>
            </div>

            {/* Tabla Historial Personales */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Historial: {mesesNombres[selectedMonth - 1]} {selectedYear}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => exportToExcel('personal', 'mes')}
                    style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                  >
                    <FileSpreadsheet size={15} /> Excel Mensual
                  </button>
                  <button 
                    onClick={() => exportToExcel('personal', 'anual')}
                    style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                  >
                    <FileSpreadsheet size={15} /> Excel Anual ({selectedYear})
                  </button>
                  <button 
                    onClick={resetPersonalCurrentMonth}
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                  >
                    <RotateCcw size={15} /> Reiniciar Mes
                  </button>
                </div>
              </div>

              {filteredPersonalTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay movimientos registrados en {mesesNombres[selectedMonth - 1]} {selectedYear}.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                      <th style={{ padding: '10px' }}>Fecha</th>
                      <th style={{ padding: '10px' }}>Concepto (Editable)</th>
                      <th style={{ padding: '10px' }}>Tipo</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Monto (Editable)</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPersonalTransactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '10px', color: '#64748b' }}>{tx.date}</td>
                        <td 
                          onClick={() => editPersonalTx(tx.id, 'description', tx.description)} 
                          style={{ padding: '10px', fontWeight: '500', cursor: 'pointer', textDecoration: 'underline dotted #94a3b8' }}
                          title="Haz clic para editar concepto"
                        >
                          {tx.description}
                        </td>
                        <td style={{ padding: '10px', color: '#dc2626', fontWeight: '600' }}>{tx.type}</td>
                        <td 
                          onClick={() => editPersonalTx(tx.id, 'amount', tx.amount)}
                          style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#dc2626', cursor: 'pointer', textDecoration: 'underline dotted #94a3b8' }}
                          title="Haz clic para editar monto"
                        >
                          -${tx.amount.toFixed(2)}
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

        {/* PESTAÑA 2: NEGOCIO */}
        {activeTab === 'negocio' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Ventas ({mesesNombres[selectedMonth - 1]})</div>
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

            {/* Accesos Rápidos Negocio */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Acciones Negocio ({mesesNombres[selectedMonth - 1]} {selectedYear})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <button 
                  onClick={() => addBusinessAction('Venta')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <TrendingUp color="#16a34a" size={36} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#166534' }}>Venta (+)</span>
                </button>
                <button 
                  onClick={() => addBusinessAction('Reinversión')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <Wrench color="#2563eb" size={36} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e40af' }}>Reinversión (-)</span>
                </button>
                <button 
                  onClick={() => addBusinessAction('Gasto Negocio')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <Receipt color="#dc2626" size={36} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#991b1b' }}>Gasto Negocio (-)</span>
                </button>
              </div>
            </div>

            {/* Tabla Historial Negocio */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Historial Negocio: {mesesNombres[selectedMonth - 1]} {selectedYear}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => exportToExcel('negocio', 'mes')}
                    style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                  >
                    <FileSpreadsheet size={15} /> Excel Mensual
                  </button>
                  <button 
                    onClick={() => exportToExcel('negocio', 'anual')}
                    style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                  >
                    <FileSpreadsheet size={15} /> Excel Anual ({selectedYear})
                  </button>
                  <button 
                    onClick={resetBusinessCurrentMonth}
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                  >
                    <RotateCcw size={15} /> Reiniciar Mes
                  </button>
                </div>
              </div>

              {filteredBusinessTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay registros en el negocio para {mesesNombres[selectedMonth - 1]} {selectedYear}.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                      <th style={{ padding: '10px' }}>Fecha</th>
                      <th style={{ padding: '10px' }}>Concepto (Editable)</th>
                      <th style={{ padding: '10px' }}>Tipo</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Monto (Editable)</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBusinessTransactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '10px', color: '#64748b' }}>{tx.date}</td>
                        <td 
                          onClick={() => editBusinessTx(tx.id, 'description', tx.description)} 
                          style={{ padding: '10px', fontWeight: '500', cursor: 'pointer', textDecoration: 'underline dotted #94a3b8' }}
                          title="Haz clic para editar concepto"
                        >
                          {tx.description}
                        </td>
                        <td style={{ padding: '10px', color: tx.type === 'Venta' ? '#16a34a' : '#ea580c', fontWeight: '600' }}>{tx.type}</td>
                        <td 
                          onClick={() => editBusinessTx(tx.id, 'amount', tx.amount)}
                          style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: tx.type === 'Venta' ? '#16a34a' : '#ea580c', cursor: 'pointer', textDecoration: 'underline dotted #94a3b8' }}
                          title="Haz clic para editar monto"
                        >
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
