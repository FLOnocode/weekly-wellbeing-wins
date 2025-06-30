import { Link } from "react-router-dom";
import { ArrowLeft, BarChart, TrendingUp, Calendar, Target, LineChart as LineChartIcon, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsFilter } from "@/components/AnalyticsFilter";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { challengeService, supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Heart, Footprints, Droplets, Utensils, Dumbbell, Ban, Apple, Moon } from "lucide-react";
import { useDailyStats } from "@/hooks/use-daily-stats";

// Types de graphiques disponibles
type ChartType = 'bar' | 'line' | 'pie';

const Analytics = () => {
  const { user, profile } = useAuth();
  const [dailyChallengeData, setDailyChallengeData] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    totalPoints: 0,
    averageDaily: 0,
    bestDay: 0
  });
  const dailyStats = useDailyStats();

  // Définition des défis disponibles
  const challenges = [
    {
      id: "steps",
      title: "10 000 pas",
      icon: Footprints,
      color: "pink",
    },
    {
      id: "water",
      title: "1,5L d'eau",
      icon: Droplets,
      color: "hydration",
    },
    {
      id: "healthy-meal",
      title: "Repas sain",
      icon: Utensils,
      color: "nutrition",
    },
    {
      id: "exercise",
      title: "10 min d'exercice",
      icon: Dumbbell,
      color: "fitness",
    },
    {
      id: "no-sugar",
      title: "Journée sans sucre",
      icon: Ban,
      color: "detox",
    },
    {
      id: "fruits-veggies",
      title: "5 fruits & légumes",
      icon: Apple,
      color: "vitamins",
    },
    {
      id: "sleep",
      title: "8h de sommeil",
      icon: Moon,
      color: "rest",
    }
  ];

  // Carte des couleurs pour les graphiques (codes hexadécimaux pour Recharts)
  const chartColorsMap = {
    wellness: "#4ade80",
    energy: "#fb923c", 
    motivation: "#60a5fa",
    hydration: "#3b82f6",
    nutrition: "#22c55e",
    fitness: "#f97316",
    detox: "#ef4444",
    vitamins: "#10b981",
    rest: "#8b5cf6",
    pink: "#ec4899",
  };

  // Fonction pour obtenir la couleur principale du graphique
  const getChartMainColor = (): string => {
    // Si un seul défi est sélectionné, utiliser sa couleur
    if (selectedChallenges.length === 1) {
      const selectedChallenge = challenges.find(c => c.id === selectedChallenges[0]);
      if (selectedChallenge) {
        return chartColorsMap[selectedChallenge.color as keyof typeof chartColorsMap] || chartColorsMap.wellness;
      }
    }
    
    // Couleur par défaut
    return chartColorsMap.wellness;
  };

  const fetchAnalyticsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6); // Last 7 days including today

      const startDate = format(sevenDaysAgo, 'yyyy-MM-dd');
      const endDate = format(today, 'yyyy-MM-dd');

      // Récupérer les données des défis quotidiens avec filtre
      const dailyCounts = await challengeService.getFilteredDailyChallengeCount(
        user.id, 
        startDate, 
        endDate, 
        selectedChallenges.length > 0 ? selectedChallenges : undefined
      );
      
      const challengeData = [];
      let totalChallenges = 0;
      let maxChallenges = 0;
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo);
        date.setDate(sevenDaysAgo.getDate() + i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        const displayDate = format(date, 'dd/MM', { locale: fr });
        const challengeCount = dailyCounts[formattedDate] || 0;
        
        challengeData.push({
          date: displayDate,
          challenges: challengeCount,
        });
        
        totalChallenges += challengeCount;
        maxChallenges = Math.max(maxChallenges, challengeCount);
      }
      
      setDailyChallengeData(challengeData);

      // Données pour le graphique en camembert (répartition par type de défi)
      if (selectedChallenges.length > 0) {
        const detailedStats = await challengeService.getChallengeStatsDetailed(
          user.id, 
          startDate, 
          endDate, 
          selectedChallenges
        );

        const challengeCountMap: { [key: string]: number } = {};
        detailedStats.forEach(stat => {
          challengeCountMap[stat.challenge_id] = (challengeCountMap[stat.challenge_id] || 0) + 1;
        });

        const pieData = Object.entries(challengeCountMap).map(([challengeId, count]) => {
          const challenge = challenges.find(c => c.id === challengeId);
          return {
            name: challenge?.title || challengeId,
            value: count,
            challengeId
          };
        });

        setPieChartData(pieData);
      } else {
        // Si aucun filtre, afficher tous les défis
        const allStats = await challengeService.getChallengeStatsDetailed(user.id, startDate, endDate);
        const challengeCountMap: { [key: string]: number } = {};
        allStats.forEach(stat => {
          challengeCountMap[stat.challenge_id] = (challengeCountMap[stat.challenge_id] || 0) + 1;
        });

        const pieData = Object.entries(challengeCountMap).map(([challengeId, count]) => {
          const challenge = challenges.find(c => c.id === challengeId);
          return {
            name: challenge?.title || challengeId,
            value: count,
            challengeId
          };
        });

        setPieChartData(pieData);
      }

      // Récupérer les données de poids des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const { data: weightEntries, error: weightError } = await supabase
        .from('weight_entries')
        .select('weight, created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (!weightError && weightEntries) {
        const weightChartData = weightEntries.map(entry => ({
          date: format(new Date(entry.created_at), 'dd/MM', { locale: fr }),
          weight: entry.weight
        }));
        setWeightData(weightChartData);
      }

      // Calculer les statistiques
      const averageDaily = totalChallenges / 7;
      const totalPoints = totalChallenges * 10; // Estimation: 10 points par défi en moyenne

      setStats({
        totalChallenges,
        totalPoints,
        averageDaily: Math.round(averageDaily * 10) / 10,
        bestDay: maxChallenges
      });

    } catch (error) {
      console.error("Erreur lors de la récupération des données d'analyse:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [user, selectedChallenges]);

  const handleChallengeToggle = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId)
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const handleClearAll = () => {
    setSelectedChallenges([]);
  };

  const handleSelectAll = () => {
    setSelectedChallenges(challenges.map(c => c.id));
  };

  const renderChart = () => {
    if (loading) {
      return <div className="text-center text-white/70 py-8">Chargement des données...</div>;
    }

    const mainColor = getChartMainColor();

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={dailyChallengeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#ccc" fontSize={12} />
              <YAxis stroke="#ccc" fontSize={12} />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black/80 border border-white/20 rounded-lg p-2 backdrop-blur-sm">
                        <p className="text-white text-sm">{`${label}: ${payload[0].value} défis`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="challenges" fill={mainColor} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyChallengeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#ccc" fontSize={12} />
              <YAxis stroke="#ccc" fontSize={12} />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black/80 border border-white/20 rounded-lg p-2 backdrop-blur-sm">
                        <p className="text-white text-sm">{`${label}: ${payload[0].value} défis`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="challenges" 
                stroke={mainColor} 
                strokeWidth={2}
                dot={{ fill: mainColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: mainColor, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => {
                  // Récupérer la couleur dynamique basée sur le challengeId
                  const challenge = challenges.find(c => c.id === entry.challengeId);
                  const color = challenge 
                    ? chartColorsMap[challenge.color as keyof typeof chartColorsMap] 
                    : chartColorsMap.wellness;
                  
                  return (
                    <Cell key={`cell-${index}`} fill={color} />
                  );
                })}
              </Pie>
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black/80 border border-white/20 rounded-lg p-2 backdrop-blur-sm">
                        <p className="text-white text-sm">{`${payload[0].name}: ${payload[0].value} fois`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-wellness-500/20 via-wellness-700/30 to-black" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-wellness-400/20 blur-[80px]" />
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-wellness-300/20 blur-[60px]"
        animate={{
          opacity: [0.15, 0.3, 0.15],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <div className="relative z-20">
        <MobileHeader
          totalPoints={dailyStats.totalPoints}
          completedChallenges={dailyStats.completedChallenges}
          totalChallenges={dailyStats.totalChallenges}
        />
      </div>

      <div className="relative z-10 pt-20 pb-6">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header with back button */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-heading-2 font-bold text-gradient">Analyse</h1>
              <p className="text-body text-white/70">Suivez vos progrès avec des graphiques</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Filtres et contrôles */}
            <div className="flex flex-wrap gap-3 items-center">
              <AnalyticsFilter
                challenges={challenges}
                selectedChallenges={selectedChallenges}
                onChallengeToggle={handleChallengeToggle}
                onClearAll={handleClearAll}
                onSelectAll={handleSelectAll}
              />
              
              {/* Sélecteur de type de graphique */}
              <div className="flex gap-1 bg-white/10 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={chartType === 'bar' ? 'default' : 'ghost'}
                  onClick={() => setChartType('bar')}
                  className={`h-8 px-2 ${chartType === 'bar' ? 'bg-wellness-500' : 'text-white hover:bg-white/20'}`}
                >
                  <BarChart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={chartType === 'line' ? 'default' : 'ghost'}
                  onClick={() => setChartType('line')}
                  className={`h-8 px-2 ${chartType === 'line' ? 'bg-wellness-500' : 'text-white hover:bg-white/20'}`}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={chartType === 'pie' ? 'default' : 'ghost'}
                  onClick={() => setChartType('pie')}
                  className={`h-8 px-2 ${chartType === 'pie' ? 'bg-wellness-500' : 'text-white hover:bg-white/20'}`}
                >
                  <PieChart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="glassmorphism">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-wellness-300">{stats.totalChallenges}</div>
                  <div className="text-sm text-white/70">Défis complétés</div>
                  <div className="text-xs text-white/50">7 derniers jours</div>
                </CardContent>
              </Card>
              
              <Card className="glassmorphism">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-motivation-300">{stats.averageDaily}</div>
                  <div className="text-sm text-white/70">Moyenne/jour</div>
                  <div className="text-xs text-white/50">Défis quotidiens</div>
                </CardContent>
              </Card>
              
              <Card className="glassmorphism">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-energy-300">{stats.totalPoints}</div>
                  <div className="text-sm text-white/70">Points estimés</div>
                  <div className="text-xs text-white/50">7 derniers jours</div>
                </CardContent>
              </Card>
              
              <Card className="glassmorphism">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-300">{stats.bestDay}</div>
                  <div className="text-sm text-white/70">Meilleur jour</div>
                  <div className="text-xs text-white/50">Défis en 1 jour</div>
                </CardContent>
              </Card>
            </div>

            {/* Graphique des défis quotidiens */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                  {chartType === 'bar' && <BarChart className="h-5 w-5 text-wellness-500" />}
                  {chartType === 'line' && <LineChartIcon className="h-5 w-5 text-wellness-500" />}
                  {chartType === 'pie' && <PieChart className="h-5 w-5 text-wellness-500" />}
                  <span>
                    {chartType === 'pie' 
                      ? 'Répartition des défis' 
                      : 'Défis complétés par jour'
                    }
                  </span>
                </CardTitle>
                {selectedChallenges.length > 0 && (
                  <p className="text-sm text-white/60">
                    Filtré sur {selectedChallenges.length} défi{selectedChallenges.length > 1 ? 's' : ''}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {renderChart()}
              </CardContent>
            </Card>

            {/* Graphique d'évolution du poids */}
            {weightData.length > 0 && (
              <Card className="glassmorphism">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                    <TrendingUp className="h-5 w-5 text-motivation-500" />
                    <span>Évolution du poids</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weightData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#ccc" fontSize={12} />
                      <YAxis stroke="#ccc" fontSize={12} />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-black/80 border border-white/20 rounded-lg p-2 backdrop-blur-sm">
                                <p className="text-white text-sm">{`${label}: ${payload[0].value}kg`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke={chartColorsMap.motivation} 
                        strokeWidth={2}
                        dot={{ fill: chartColorsMap.motivation, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: chartColorsMap.motivation, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Objectifs et progression */}
            {profile && (
              <Card className="glassmorphism">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                    <Target className="h-5 w-5 text-energy-500" />
                    <span>Vos objectifs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Poids actuel</span>
                      <span className="text-white font-semibold">
                        {profile.current_weight > 0 ? `${profile.current_weight}kg` : 'Non défini'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Poids objectif</span>
                      <span className="text-white font-semibold">
                        {profile.goal_weight > 0 ? `${profile.goal_weight}kg` : 'Non défini'}
                      </span>
                    </div>
                    {profile.current_weight > 0 && profile.goal_weight > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Reste à perdre</span>
                        <span className="text-wellness-300 font-semibold">
                          {Math.max(0, profile.current_weight - profile.goal_weight).toFixed(1)}kg
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Message d'encouragement */}
            <Card className="glassmorphism border-wellness-400/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-white/80 text-sm">
                  {stats.totalChallenges > 0 
                    ? `Excellent travail ! Vous avez complété ${stats.totalChallenges} défis cette semaine.`
                    : "Commencez à compléter des défis pour voir vos statistiques ici !"
                  }
                </p>
                {selectedChallenges.length > 0 && (
                  <p className="text-wellness-300 text-xs mt-2">
                    Données filtrées sur {selectedChallenges.length} défi{selectedChallenges.length > 1 ? 's' : ''} sélectionné{selectedChallenges.length > 1 ? 's' : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;