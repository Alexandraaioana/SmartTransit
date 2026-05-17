import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, User, Phone, Mail, MapPin, CreditCard, Car, Star, Calendar } from 'lucide-react';

export default function AdminClientDetails() {
  const { id } = useParams(); // Preia ID-ul din URL
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/admin/clients/${id}/details`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Eroare la extragerea detaliilor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-blue-600 font-bold animate-pulse">Se încarcă dosarul clientului...</div>;
  if (!data || !data.client) return <div className="p-8 text-center text-red-500 font-bold">Clientul nu a fost găsit.</div>;

  const { client, stats, curse, recenzii } = data;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* HEADER & BACK BUTTON */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/clients" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </Link>
        <h2 className="text-3xl font-bold">Dosar Client: {client.nume}</h2>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${client.activ ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {client.activ ? 'CONT ACTIV' : 'CONT INACTIV'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLOANA STÂNGĂ: Date Personale & Statistici */}
        <div className="space-y-6">
          {/* Card Date Personale */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
              <User size={20} className="text-blue-600" /> Informații Personale
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 mt-1" />
                <div><p className="text-xs text-gray-500 font-bold">EMAIL</p><p className="font-medium">{client.mail}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 mt-1" />
                <div><p className="text-xs text-gray-500 font-bold">TELEFON</p><p className="font-medium">{client.nr_tel || 'Nespecificat'}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-1" />
                <div><p className="text-xs text-gray-500 font-bold">ADRESĂ</p><p className="font-medium">{client.adresa || 'Nespecificată'}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard size={18} className="text-gray-400 mt-1" />
                <div><p className="text-xs text-gray-500 font-bold">METODĂ PLATĂ</p><p className="font-medium">{client.metoda_plata || 'Nespecificată'}</p></div>
              </div>
            </div>
          </div>

          {/* Card Statistici */}
          <div className="bg-blue-600 text-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold mb-4 border-b border-blue-500 pb-2">Sumar Activitate</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-blue-200 text-sm">Curse Totale</p><p className="text-3xl font-light">{stats.total_curse || 0}</p></div>
              <div><p className="text-blue-200 text-sm">Bani Cheltuiți</p><p className="text-3xl font-light">{Number(stats.bani_cheltuiti).toFixed(2)} lei</p></div>
              <div className="col-span-2"><p className="text-blue-200 text-sm">Kilometri Parcurși</p><p className="text-3xl font-light">{client.km_parcursi || 0} km</p></div>
            </div>
          </div>
        </div>

        {/* COLOANA DREAPTĂ: Curse și Recenzii */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECȚIUNE CURSE */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Car size={24} className="text-blue-600" /> Istoric Curse
            </h3>
            {curse.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="p-3 rounded-tl-lg">ID</th>
                      <th className="p-3">Plecare</th>
                      <th className="p-3">Destinație</th>
                      <th className="p-3">Preț</th>
                      <th className="p-3 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curse.map((c: any) => (
                      <tr key={c.id_cursa} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-500">#{c.id_cursa}</td>
                        <td className="p-3 text-sm">{c.loc_plecare}</td>
                        <td className="p-3 text-sm">{c.loc_sosire}</td>
                        <td className="p-3 font-bold">{c.pret_final} lei</td>
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
              <p className="text-gray-500 italic">Acest client nu a efectuat nicio cursă încă.</p>
            )}
          </div>

          {/* SECȚIUNE RECENZII */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star size={24} className="text-yellow-500" /> Recenzii Oferite
            </h3>
            {recenzii.length > 0 ? (
              <div className="space-y-4">
                {recenzii.map((r: any) => (
                  <div key={r.id_recenzie} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-1 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={16} fill={i < r.nota ? "currentColor" : "none"} className={i < r.nota ? "" : "text-gray-300"} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> Cursa #{r.cursa_id_cursa}</span>
                    </div>
                    <p className="text-gray-700 text-sm italic">"{r.comentariu || 'Fără comentariu'}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Acest client nu a lăsat nicio recenzie.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}