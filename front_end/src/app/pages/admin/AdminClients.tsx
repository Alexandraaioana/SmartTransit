import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({ id_client: null, nume: '', nr_tel: '', mail: '', parola: '' });
  const [isEditing, setIsEditing] = useState(false);

  // STATE-URI PENTRU CĂUTARE ȘI FILTRARE
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('');

  const fetchClients = async () => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        status: filterStatus,
        sort: sortBy
      }).toString();

      const res = await fetch(`http://localhost:5050/api/admin/clients?${queryParams}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
      }
    } catch (err) {
      console.error("Eroare frontend la fetch:", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [searchTerm, filterStatus, sortBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing 
        ? `http://localhost:5050/api/admin/clients/${formData.id_client}` 
        : 'http://localhost:5050/api/admin/clients';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchClients();
      setFormData({ id_client: null, nume: '', nr_tel: '', mail: '', parola: '' });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Ești sigur că vrei să dezactivezi acest client?")) return;
    await fetch(`http://localhost:5050/api/admin/clients/${id}`, { method: 'DELETE' });
    fetchClients();
  };

  const handleActivate = async (id: number) => {
    if(!confirm("Re-activezi acest client?")) return;
    await fetch(`http://localhost:5050/api/admin/clients/${id}/activate`, { method: 'PUT' });
    fetchClients();
  };

  // --- VARIANTE DE ANIMAȚIE (FRAMER MOTION) ---
  const tableContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 } // Întârziere între rânduri
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    // Animația principală a paginii (Fade & Slide Up)
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
    >
      <h2 className="text-2xl font-bold mb-6">Gestionare Clienți</h2>

      {/* FORMULAR ANIMAT */}
      <motion.form 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        onSubmit={handleSubmit} 
        className="bg-white p-6 rounded-lg shadow-sm mb-8 flex gap-4 items-end border"
      >
        <div className="flex-1">
          <label className="block text-sm mb-1 text-gray-600 font-medium">Nume Complet</label>
          <input type="text" value={formData.nume || ''} onChange={e => setFormData({...formData, nume: e.target.value})} className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1 text-gray-600 font-medium">Email</label>
          <input type="email" value={formData.mail || ''} onChange={e => setFormData({...formData, mail: e.target.value})} className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1 text-gray-600 font-medium">Telefon</label>
          <input type="number" value={formData.nr_tel || ''} onChange={e => setFormData({...formData, nr_tel: e.target.value})} className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
        </div>
        {!isEditing && (
          <div className="flex-1">
            <label className="block text-sm mb-1 text-gray-600 font-medium">Parolă</label>
            <input type="text" value={formData.parola || ''} onChange={e => setFormData({...formData, parola: e.target.value})} className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
          </div>
        )}
        
        {/* Buton cu fizică de arc */}
        <motion.button 
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          type="submit" 
          className="bg-blue-600 text-white px-6 py-2 rounded font-medium shadow-sm hover:bg-blue-700"
        >
          {isEditing ? 'Salvează' : 'Adaugă'}
        </motion.button>

        {isEditing && (
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            type="button" 
            onClick={() => { setIsEditing(false); setFormData({id_client: null, nume:'', nr_tel:'', mail:'', parola:''}) }} 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-300"
          >
            Anulează
          </motion.button>
        )}
      </motion.form>

      {/* FILTRE */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex gap-4 items-center border">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Caută după nume sau email..." 
            className="w-full border border-gray-200 p-2 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select className="border border-gray-200 p-2 rounded bg-slate-50 focus:bg-white outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Toți Clienții</option>
            <option value="1">Doar Activi</option>
            <option value="0">Doar Inactivi</option>
          </select>
        </div>
        <div>
          <select className="border border-gray-200 p-2 rounded bg-slate-50 focus:bg-white outline-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="id_desc">Cei mai noi primii</option>
            <option value="nume_asc">Alfabetic (A-Z)</option>
            <option value="km_desc">Cei mai mulți KM</option>
          </select>
        </div>
      </div>

      {/* TABEL CLIENȚI ANIMAT */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Nume</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="p-4 text-sm font-semibold text-gray-600">KM Parcurși</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-right text-sm font-semibold text-gray-600">Acțiuni</th>
            </tr>
          </thead>
          
          {/* Tag special Framer Motion pentru efect de cascadă */}
          <motion.tbody 
            variants={tableContainerVariants}
            initial="hidden"
            animate="show"
          >
            {clients.map((c: any) => (
              <motion.tr 
                variants={tableRowVariants}
                key={c.id_client} 
                className="border-b last:border-b-0 hover:bg-slate-50 transition-colors"
              >
                <td className="p-4 text-gray-500 font-medium">#{c.id_client}</td>
                <td className="p-4 font-semibold text-gray-800">{c.nume}</td>
                <td className="p-4 text-gray-600">{c.mail}</td>
                <td className="p-4 font-bold text-slate-500">{c.km_parcursi} km</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.activ === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.activ === 1 ? 'Activ' : 'Inactiv'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3 flex justify-end items-center">
                  
                  {/* Link animat la hover */}
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link 
                      to={`/admin/client/${c.id_client}`} 
                      className="p-2 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Vezi istoric complet"
                    >
                      <Eye size={18} />
                    </Link>
                  </motion.div>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setFormData(c); setIsEditing(true); }} 
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Editează
                  </motion.button>
                  
                  {c.activ === 1 ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(c.id_client)} 
                      className="text-red-600 font-medium hover:underline"
                    >
                      Dezactivează
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActivate(c.id_client)} 
                      className="text-green-600 font-bold hover:underline"
                    >
                      Activează
                    </motion.button>
                  )}
                </td>
              </motion.tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">Niciun client nu a fost găsit.</td></tr>
            )}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
}