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

  // --- FECHA SELECCIONADA PARA FILTRAR (Mes / Año) ---
  const currentDateObj = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDateObj.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(currentDateObj.getFullYear());

  // --- ESTADOS: GASTOS PERSONALES ---
  const [ingresosFijosMes, setIngresosFijosMes] = useState(() => {
    const saved = localStorage.getItem('personal_ingresos_fijos_mes');
    return saved ? JSON.parse(saved) : {}; // { "2026-5": 6200, ... }
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
    localStorage.setItem('personal_ingresos_fijos_mes', JSON.stringify(ingresosFijosMes));
    localStorage.setItem('personal_transactions', JSON.stringify(personalTransactions));
  }, [ingresosFijosMes, personalTransactions]);

  useEffect(() => {
    localStorage.setItem('business_transactions', JSON.stringify(businessTransactions));
  }, [businessTransactions]);

  // Clave del periodo actual (ej: "2026-5" para junio 2026)
  const currentPeriodKey = `${selectedYear}-${selectedMonth}`;
  const ingresoFijoActual = ingresosFijosMes[currentPeriodKey] !== undefined ? ingresosFijosMes[currentPeriodKey] : 6200;

  const handleUpdateIngresoFijo = (val) => {
    const nuevoValor = parseFloat(val) || 0;
    setIngresosFijosMes({
      ...ingresosFijosMes,
      [currentPeriodKey]: nuevoValor
    });
  };

  // Filtrar transacciones por mes y año seleccionado
  const filterBySelectedPeriod = (tx) => {
    // tx.date formato esperado: "DD/MM/YYYY" o similar de toLocaleDateString()
    const partes = tx.date.split('/');
    if (partes.length === 3) {
      const d = parseInt(partes[0], 10);
      const m = parseInt(partes[1], 10) - 1; // mes 0-index
      const y = parseInt(partes[2], 10);
      return m === selectedMonth && y === selectedYear;
    }
    return false;
  };

  const personalFiltered = personalTransactions.filter(filterBySelectedPeriod);
  const businessFiltered = businessTransactions.filter(filterBySelectedPeriod);

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

    const fechaHoy = new Date();
    // Si el usuario está viendo otro mes histórico, opcionalmente podemos poner la fecha del mes seleccionado o la actual. Usamos la actual por defecto.
    const newTx = {
      id: Date.now(),
      description: finalCategory,
      amount: parseFloat(amount),
      type: 'Gasto',
      category: category === 'Otros Gastos' ? 'Otros' : category,
      date: fechaHoy.toLocaleDateString()
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

  const resetPersonalPeriod = () => {
    if (confirm(`¿Estás seguro de eliminar los registros personales de este mes (${selectedMonth + 1}/${selectedYear})?`)) {
      setPersonalTransactions(personalTransactions.filter(tx => !filterBySelectedPeriod(tx)));
    }
  };

  // Cálculos Personales (Mes Seleccionado)
  const totalGastosPersonales = personalFiltered
    .filter(tx => tx.type === 'Gasto')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalIngresosPersonalesAdicionales = personalFiltered
    .filter(tx => tx.type === 'Ingreso')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balancePersonal = (ingresoFijoActual + totalIngresosPersonalesAdicionales) - totalGastosPersonales;

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

    const fechaHoy = new Date();
    const newTx = {
      id: Date.now(),
      description: descripcionFinal,
      amount: parseFloat(amount),
      type: type,
      date: fechaHoy.toLocaleDateString()
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

  const resetBusinessPeriod = () => {
    if (confirm(`¿Estás seguro de eliminar los registros del negocio de este mes (${selectedMonth + 1}/${selectedYear})?`)) {
      setBusinessTransactions(businessTransactions.filter(tx => !filterBySelectedPeriod(tx)));
    }
  };

  // Cálculos Negocio (Mes Seleccionado)
  const totalVentas = businessFiltered
    .filter(tx => tx.type === 'Venta')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalReinversion = businessFiltered
    .filter(tx => tx.type === 'Reinversión')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalGastosNegocio = businessFiltered
    .filter(tx => tx.type === 'Gasto Negocio')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balanceNegocio = totalVentas - (totalReinversion + totalGastosNegocio);

  // --- EXPORTAR A EXCEL (Mensual o Anual) ---
  const exportToExcel = (tipo, alcance) => {
    let dataToExport = [];
    let nombreArchivo = "";

    if (alcance === 'mensual') {
      dataToExport = tipo === 'personal' ? personalFiltered : businessFiltered;
      nombreArchivo = `reporte_${tipo}_${selectedMonth + 1}_${selectedYear}.csv`;
    } else {
      // Anual completo
      dataToExport = (tipo === 'personal' ? personalTransactions : businessTransactions).filter(tx => {
        const partes = tx.date.split('/');
        return partes.length === 3 && parseInt(partes[2], 10) === selectedYear;
      });
      nombreArchivo = `reporte_anual_${tipo}_${selectedYear}.csv`;
    }

    let csvContent = "data:text/csv;charset=utf-8,ID,Fecha,Descripcion,Tipo,Monto\n";
    dataToExport.forEach(tx => {
      csvContent += `${tx.id},${tx.date},"${tx.description}",${tx.type},${tx.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", nombreArchivo);
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
        
        {/* Encabezado Principal y Selector de Periodo Histórico */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#2563eb' }}>
              <Wallet size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Control Financiero Integral</h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Historial y Balances Mensuales / Anuales</p>
            </div>
          </div>

          {/* Selector de Mes y Año para ver historial */}
          <div style={{ backgroundColor: 'white', padding: '10px 16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#2563eb" />
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Periodo:</span>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '600', backgroundColor: '#f8fafc' }}
            >
              {mesesNombres.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '600', backgroundColor: '#f8fafc' }}
            >
              {[2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
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

        {/* =================================================== */}
        {/* PESTAÑA 1: GASTOS PERSONALES                        */}
        {/* =================================================== */}
        {activeTab === 'personales' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12pxAquí tienes el código actualizado con el **sistema de control mensual y anual**. 

### Novedades de esta versión:
1. **Filtro de Mes y Año:** Ahora en la parte superior verás un selector donde puedes elegir qué mes y año deseas consultar (por defecto inicia en el mes actual). Cada primero de mes, la aplicación abrirá automáticamente con el mes en curso limpio para empezar a registrar de cero.
2. **Historial por Periodo:** Las tablas y los totales de balances (tanto en Personales como en Negocio) se actualizan automáticamente para mostrar únicamente los datos del mes y año que tengas seleccionado arriba.
3. **Exportar a Excel Mensual o Anual:** 
   * Puedes descargar un reporte en Excel (CSV) filtrado exactamente al **mes que elijas**.
   * O bien, descargar un reporte con **todo el año** completo de manera consolidada.

Actualiza tu archivo `src/App.jsx` con este código:

```jsx
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

  // Función auxiliar para obtener fecha en formato "MM/DD/YYYY" o parsearla
  // Asumiremos que guardamos tx.dateString formato 'YYYY-MM-DD' para filtrar fácil, o extraemos de date local.
  // Vamos a estructurar los registros guardando una fecha ISO (YYYY-MM-DD) oculta o analizando la fecha.
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
      isoDate: getFormattedDateISO() // Formato YYYY-MM-DD para filtrar perfecto
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
        if (!tx.isoDate) return true; // compatibilidad por si hay registros viejos
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

  // ---
