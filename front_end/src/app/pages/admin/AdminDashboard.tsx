import { useState, useEffect, useRef } from 'react';
import { Users, Car, MapPin, DollarSign } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
}

function AnimatedNumber({ value, decimals = 0, suffix = "" }: AnimatedNumberProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true }); 
  
  const count = useMotionValue(0);

  const rounded = useTransform(count, (latest) => {
    return latest.toFixed(decimals) + suffix;
  });

  useEffect(() => {
    if (isInView) {
      animate(count, value, {
        duration: 2, 
        ease: [0.1, 0.9, 0.2, 1],
      });
    }
  }, [isInView, value, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_clienti: 0,
    total_soferi: 0,
    total_curse: 0,
    venit_total: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5050/api/admin/dashboard-stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Eroare la aducerea statisticilor:", err);
      }
    };
    fetchStats();
  }, []);

  // Variante pentru animația de intrare a cardurilor (stagger/cascadă)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15 // Întârziere între apariția cardurilor
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 20 } 
    }
  };

  return (
    // Animația de intrare a întregii pagini
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
      <p className="text-slate-500 mb-8">O privire de ansamblu asupra platformei SmartTransit.</p>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        
        <motion.div variants={cardVariants} className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Clienți Activi</p>
            <p className="text-2xl font-bold text-slate-800">
              {/* Folosim componenta animată în loc de text simplu */}
              <AnimatedNumber value={stats.total_clienti} />
            </p>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-green-100 text-green-600 rounded-full">
            <Car className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Șoferi Activi</p>
            <p className="text-2xl font-bold text-slate-800">
              <AnimatedNumber value={stats.total_soferi} />
            </p>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Curse Totale</p>
            <p className="text-2xl font-bold text-slate-800">
              <AnimatedNumber value={stats.total_curse} />
            </p>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Venituri (RON)</p>
            <p className="text-2xl font-bold text-slate-800">
              <AnimatedNumber value={stats.venit_total} decimals={2} suffix=" lei" />
            </p>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}