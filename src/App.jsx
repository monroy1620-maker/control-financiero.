import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, PlusCircle, 
  Trash2, RefreshCw, CheckCircle, AlertCircle, FileText, DollarSign 
} from 'lucide-react';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('ingreso');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Sincronizado');

  // URL de SheetDB (puedes cambiarla por tu endpoint real cuando lo conectes)
  const SHEETDB_URL = 'https://sheetdb.io/api/v1/tu-api-id';

  // Cargar datos al iniciar
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Si usas SheetDB, aquí se hace la petición GET. 
      // Por ahora usamos datos locales de prueba si no está configurada la API.
      const saved = localStorage.getItem('control_financiero_txs');
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
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
    setSyncStatus('Actualizado localmente');
  };

  const handleDelete = async (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('control_financiero_txs', JSON.stringify(updated));
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Encabezado */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet color="#2563eb" /> Control Financiero
          </h1>
          <span style={{ fontSize: '14px', backgroundColor: '#e2e8f0', padding: '6px 12px', borderRadius: '20px', color: '#475569' }}>
            {syncStatus}
          </span>
        </header>

        {/* Tarjetas de Resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Balance Total</p>
            <h2 style={{ fontSize: '28px', color: balance >= 0 ? '#16a34a' : '#dc2626', margin: 0 }}>
              ${balance.toFixed(2)}
            </h2>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Ingresos</p>
            <h2 style={{ fontSize: '24px', color: '#16a34a', margin: 0 }}>${totalIngresos.toFixed(2)}</h2>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Gastos</p>
            <h2 style={{ fontSize: '24px', color: '#dc2626', margin: 0 }}>${totalGastos.toFixed(2)}</h2>
          </div>
        </div>

        {/* Formulario para agregar */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1e293b' }}>Nueva Transacción</h3>
          <form onSubmit={handleAddTransaction} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 140px', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Descripción" 
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
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No hay transacciones registradas todavía.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {transactions.map((t) => (
                <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontWeight: '500', color: '#334155', display: 'block' }}>{t.descripcion}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{t.fecha}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: 'bold', color: t.tipo === 'ingreso' ? '#16a34a' : '#dc2626' }}>
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

      </div>
    </div>
  );
}
