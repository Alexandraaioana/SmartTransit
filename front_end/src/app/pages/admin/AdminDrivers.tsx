import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router'; 
import { Eye } from 'lucide-react';

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({ id_sofer: null, nume: '', telefon: '', mail: '', parola: '', cnp: '' });
  const [isEditing, setIsEditing] = useState(false);

  // --- STATE-URI NOI PENTRU CĂUTARE ȘI FILTRARE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Modificăm fetch-ul pentru a trimite parametrii prin URL
  const fetchDrivers = async () => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        status: filterStatus,
        sort: sortBy
      }).toString();

      const res = await fetch(`http://localhost:5050/api/admin/drivers?${queryParams}`);
      const data = await res.json();
      if (Array.isArray(data)) setDrivers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Se reapelează automat când se schimbă ceva în filtre
  useEffect(() => { 
    fetchDrivers(); 
  }, [searchTerm, filterStatus, sortBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing 
        ? `http://localhost:5050/api/admin/drivers/${formData.id_sofer}` 
        : 'http://localhost:5050/api/admin/drivers';
    const method = isEditing ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    fetchDrivers();
    setFormData({ id_sofer: null, nume: '', telefon: '', mail: '', parola: '', cnp: '' });
    setIsEditing(false);
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Dezactivezi acest șofer?")) return;
    await fetch(`http://localhost:5050/api/admin/drivers/${id}`, { method: 'DELETE' });
    fetchDrivers();
  };

  const handleActivate = async (id: number) => {
    if(!confirm("Re-activezi acest șofer?")) return;
    await fetch(`http://localhost:5050/api/admin/drivers/${id}/activate`, { method: 'PUT' });
    fetchDrivers();
  };

  // --- VARIANTE DE ANIMAȚIE (FRAMER MOTION) ---
  const tableContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
    >
      <h2 className="text-2xl font-bold mb-6">Gestionare Șoferi</h2>

      {/* FORMULAR ANIMAT */}
      <motion.form 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        onSubmit={handleSubmit} 
        className="bg-white p-6 rounded-xl shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end border border-gray-100"
      >
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-600 mb-1">Nume Complet</label>
          <input type="text" value={formData.nume || ''} onChange={e => setFormData({...formData, nume: e.target.value})} className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input type="email" value={formData.mail || ''} onChange={e => setFormData({...formData, mail: e.target.value})} className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Telefon</label>
          <input type="text" value={formData.telefon || ''} onChange={e => setFormData({...formData, telefon: e.target.value})} className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">CNP</label>
          <input type="text" value={formData.cnp || ''} onChange={e => setFormData({...formData, cnp: e.target.value})} className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" required />
        </div>
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Parolă</label>
            <input type="text" value={formData.parola || ''} onChange={e => setFormData({...formData, parola: e.target.value})} className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" required />
          </div>
        )}
        <div className="flex gap-2 h-10 mt-6 md:mt-0">
          <motion.button 
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            type="submit" 
            className="bg-green-600 text-white px-6 py-2 rounded font-medium shadow-sm hover:bg-green-700 flex-1"
          >
            {isEditing ? 'Salvează' : 'Adaugă Șofer'}
          </motion.button>
          {isEditing && (
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="button" 
              onClick={() => {setIsEditing(false); setFormData({id_sofer:null, nume:'', telefon:'', mail:'', parola:'', cnp:''})}} 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-300 transition-colors"
            >
              Anulează
            </motion.button>
          )}
        </div>
      </motion.form>

      {/* ZONA DE CĂUTARE ȘI FILTRARE NOUĂ */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex gap-4 items-center border border-gray-100">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Caută după nume sau email..." 
            className="w-full border border-gray-200 p-2 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select className="border border-gray-200 p-2 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Toți Șoferii</option>
            <option value="1">Doar Activi</option>
            <option value="0">Doar Inactivi</option>
          </select>
        </div>
        <div>
          <select className="border border-gray-200 p-2 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="id_desc">Cei mai noi primii</option>
            <option value="nume_asc">Alfabetic (A-Z)</option>
          </select>
        </div>
      </div>

      {/* TABEL ȘOFERI ANIMAT */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Nume</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status Activitate</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status Cont</th>
              <th className="p-4 text-right text-sm font-semibold text-gray-600">Acțiuni</th>
            </tr>
          </thead>
          
          <motion.tbody 
            variants={tableContainerVariants}
            initial="hidden"
            animate="show"
          >
            {drivers.map((d: any) => (
              <motion.tr 
                variants={tableRowVariants}
                key={d.id_sofer} 
                className="border-b last:border-b-0 hover:bg-slate-50 transition-colors"
              >
                <td className="p-4 font-semibold text-gray-800">{d.nume}</td>
                <td className="p-4 text-gray-600">{d.mail}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${d.status == 'Disponibil' ? 'bg-blue-100 text-blue-700' : d.status == 'In cursa' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                    {d.status || 'Nespecificat'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${d.activ == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {d.activ == 1 ? 'Activ' : 'Inactiv'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3 flex justify-end items-center">
                  
                  {/* BUTONUL OCHI (STIL APPLE PREMIUM) */}
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link 
                      to={`/admin/driver/${d.id_sofer}`} 
                      className="p-2 flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Vezi dosar complet"
                    >
                      <Eye size={18} />
                    </Link>
                  </motion.div>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {setFormData(d); setIsEditing(true);}} 
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Editează
                  </motion.button>
                  
                  {d.activ == 1 ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(d.id_sofer)} 
                      className="text-red-600 font-medium hover:underline"
                    >
                      Dezactivează
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActivate(d.id_sofer)} 
                      className="text-green-600 font-bold hover:underline"
                    >
                      Activează
                    </motion.button>
                  )}
                </td>
              </motion.tr>
            ))}
            {drivers.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500 italic">Niciun șofer nu a fost găsit.</td></tr>
            )}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
}