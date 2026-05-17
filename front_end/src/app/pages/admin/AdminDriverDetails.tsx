import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, User, Phone, Mail, MapPin, Car, Star, Calendar, FileText, DollarSign, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDriverDetails() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/admin/drivers/${id}/details`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Eroare:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-green-600 font-bold animate-pulse">Se încarcă dosarul șoferului...</div>;
  if (!data || !data.driver) return <div className="p-8 text-center text-red-500 font-bold">Șoferul nu a fost găsit.</div>;

  const { driver, stats, curse, recenzii, masina, certificat } = data;

  // Calculăm media recenziilor
  const medieRecenzii = recenzii.length > 0 
    ? (recenzii.reduce((acc: number, r: any) => acc + r.nota, 0) / recenzii.length).toFixed(1)
    : 'N/A';

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto pb-12">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/drivers" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </Link>
        <h2 className="text-3xl font-bold">Dosar Șofer: {driver.nume}</h2>
        <span className={`ml-auto px-4 py-1 rounded-full text-sm font-bold ${driver.activ == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {driver.activ == 1 ? 'CONT ACTIV' : 'CONT INACTIV'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLOANA STÂNGĂ: Date Personale, Mașină & Statistici */}
        <div className="space-y-6">
          
          {/* Card Statistici */}
          <div className="bg-green-600 text-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4 border-b border-green-500 pb-4">
              <div><p className="text-green-200 text-sm font-medium">Bani Generați</p><p className="text-3xl font-bold">{Number(stats.bani_generati).toFixed(2)} lei</p></div>
              <div className="text-right"><p className="text-green-200 text-sm font-medium">Rating</p><p className="text-3xl font-bold flex items-center justify-end gap-1"><Star size={24} className="fill-white"/> {medieRecenzii}</p></div>
            </div>
            <div><p className="text-green-200 text-sm font-medium">Curse Finalizate</p><p className="text-2xl font-semibold">{stats.total_curse}</p></div>
          </div>

          {/* Card Date Personale */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
              <User size={20} className="text-green-600" /> Informații Personale
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 mt-1" />
                <div><p className="text-xs text-gray-500 font-bold">EMAIL</p><p className="font-medium">{driver.mail}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 mt-1" />
                <div><p className="text-xs text-gray-500 font-bold">TELEFON</p><p className="font-medium">{driver.telefon}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-gray-400 mt-1" />
                <div><p className="text-xs text-gray-500 font-bold">CNP</p><p className="font-medium">{driver.cnp || 'Nespecificat'}</p></div>
              </div>
            </div>
          </div>

          {/* Card Mașină */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
              <Car size={20} className="text-green-600" /> Detalii Mașină
            </h3>
            {masina ? (
              <div className="space-y-4">
                <p><span className="text-xs text-gray-500 font-bold block">MODEL</span> <span className="font-medium">{masina.marca} {masina.model}</span></p>
                <p><span className="text-xs text-gray-500 font-bold block">NR. ÎNMATRICULARE</span> <span className="font-bold uppercase bg-gray-100 px-2 py-1 rounded border">{masina.nr_inmatriculare}</span></p>
                <p><span className="text-xs text-gray-500 font-bold block">CULOARE / AN</span> <span className="font-medium">{masina.culoare} • {masina.an_fabricatie}</span></p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Nu există date despre mașină înregistrate.</p>
            )}
          </div>

          {/* Card Certificat */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
              <ShieldCheck size={20} className="text-green-600" /> Certificat & Atestat
            </h3>
            {certificat ? (
               <div className="space-y-3 text-sm">
                  <p><span className="text-gray-500 font-bold">NR. DOSAR:</span> {certificat.numar_dosar}</p>
                  <p><span className="text-gray-500 font-bold">EMIS LA:</span> {certificat.data_emitere}</p>
                  <p><span className="text-gray-500 font-bold">EXPIRĂ LA:</span> <span className="text-red-500 font-bold">{certificat.data_expirare}</span></p>
               </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Nu există atestate încărcate.</p>
            )}
          </div>

        </div>

        {/* COLOANA DREAPTĂ: Curse și Recenzii */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECȚIUNE CURSE */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin size={24} className="text-green-600" /> Istoric Curse
            </h3>
            {curse.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="p-3 rounded-tl-lg">ID</th>
                      <th className="p-3">Plecare</th>
                      <th className="p-3">Destinație</th>
                      <th className="p-3">Venit</th>
                      <th className="p-3 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curse.map((c: any) => (
                      <tr key={c.id_cursa} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-500">#{c.id_cursa}</td>
                        <td className="p-3 text-sm">{c.plecare}</td>
                        <td className="p-3 text-sm">{c.destinatie}</td>
                        <td className="p-3 font-bold text-green-700">+{c.pret_final} lei</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded font-bold ${c.status === 'Finalizat' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">Acest șofer nu a efectuat nicio cursă.</p>
            )}
          </div>

          {/* SECȚIUNE RECENZII */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star size={24} className="text-yellow-500" /> Recenzii Primite
            </h3>
            {recenzii.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recenzii.map((r: any) => (
                  <div key={r.id_recenzie} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-1 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={16} fill={i < r.nota ? "currentColor" : "none"} className={i < r.nota ? "" : "text-gray-300"} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 font-mono">Recenzia #{r.id_recenzie}</span>
                    </div>
                    <p className="text-gray-700 text-sm italic">"{r.comentarii || 'A lăsat doar notă.'}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Acest șofer nu a primit nicio recenzie.</p>
            )}
          </div>
          </div>
      </div>
    </motion.div>
  );
}