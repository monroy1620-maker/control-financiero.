import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const API_URL = "https://sheetdb.io/api/v1/im5ya1q8nsojg";

export default function FinanceApp() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const [context, setContext] = useState('Negocio'); // Negocio o Personal
  const [type, setType] = useState('Ingreso'); // Ingreso o Gasto
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Cargar datos desde Google Sheets al abrir la app
  const fetchTransactions = async () => {
    setSyncing(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        // Aseguramos que los montos sean números
        const formatted = data.map(item => ({
          ...item,
          amount: Number(item.amount) || 0
        }));
        setTransactions(formatted);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Agregar una transacción nueva y sincronizarla en la nube
  const addTransaction = async (e) => {
    e.preventDefault();
    if (!category || !amount) return;

    const newTx = {
      id: Date.now().toString(),
      context,
      type,
      category,
      amount: Number(amount),
      date
    };

    setSyncing(true);
    try {
      // Guardar en SheetDB (Google Sheets)
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [newTx] })
      });

      // Actualizar pantalla localmente
      setTransactions([newTx, ...transactions]);
      setCategory('');
      setAmount('');
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar en la nube. Revisa tu conexión.");
    } finally {
      setSyncing(false);
    }
  };

  // Eliminar transacción
  const deleteTransaction = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;

    setSyncing(true);
    try {
      await fetch(`${API_URL}/id/${id}`, {
        method: 'DELETE'
      });
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el registro.");
    } finally {
      setSyncing(false);
    }
  };

  // Cálculos totales
  const totalIngresos = transactions.filter(t => t.type === 'Ingreso').reduce((acc, t) => acc + t.amount, 0);
  const totalGastos = transactions.filter(t => t.type === 'Gasto').reduce((acc, t) => acc + t.amount, 0);
  const balanceNeto = totalIngresos - totalGastos;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#1E293B', margin: 0 }}>Control Financiero Sincronizado</h1>
        <button 
          onClick={fetchTransactions} 
          disabled={syncing}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          <RefreshCw size={16} className={syncing ? 'spin' : ''} />
          {syncing ? 'Sincronizando...' : 'Actualizar'}
        </button>
      </header>

      {/* Tarjetas de Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>Ingresos Totales</p>
          <h2 style={{ margin: '5px 0 0 0', color: '#059669' }}>${totalIngresos.toLocaleString()}</h2>
        </div>
        <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #EF4444' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>Gastos Totales</p>
          <h2 style={{ margin: '5px 0 0 0', color: '#DC2626' }}>${totalGastos.toLocaleString()}</h2>
        </div>
        <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>Balance Neto</p>
          <h2 style={{ margin: '5px 0 0 0', color: balanceNeto >= 0 ? '#2563EB' : '#DC2626' }}>${balanceNeto.toLocaleString()}</h2>
        </div>
      </div>

      {/* Formulario para Agregar */}
      <form onSubmit={addTransaction} style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#64748B' }}>Contexto</label>
          <select value={context} onChange={e => setContext(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
            <option value="Negocio">Negocio</option>
            <option value="Personal">Personal</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#64748B' }}>Tipo</label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
            <option value="Ingreso">Ingreso</option>
            <option value="Gasto">Gasto</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#64748B' }}>Categoría / Concepto</label>
          <input type="text" placeholder="Ej. Taladro, Comida..." value={category} onChange={e => setCategory(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#64748B' }}>Monto ($)</label>
          <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#64748B' }}>Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" disabled={syncing} style={{ background: '#10B981', color: 'white', border: 'none', padding: '9px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Agregar
        </button>
      </form>

      {/* Lista de Movimientos */}
      <h3 style={{ color: '#1E293B', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>Historial de Movimientos</h3>
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748B' }}>Cargando datos desde la nube...</p>
      ) : transactions.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748B' }}>No hay registros todavía. ¡Agrega el primero!</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', textAlign: 'left', color: '#475569', fontSize: '14px' }}>
                <th style={{ padding: '12px' }}>Fecha</th>
                <th style={{ padding: '12px' }}>Contexto</th>
                <th style={{ padding: '12px' }}>Tipo</th>
                <th style={{ padding: '12px' }}>Concepto</th>
                <th style={{ padding: '12px' }}>Monto</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '14px' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>{t.date}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{t.context}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: t.type === 'Ingreso' ? '#D1FAE5' : '#FEE2E2', color: t.type === 'Ingreso' ? '#065F46' : '#991B1B' }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#334155' }}>{t.category}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: t.type === 'Ingreso' ? '#059669' : '#DC2626' }}>
                    ${Number(t.amount).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => deleteTransaction(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }} title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
