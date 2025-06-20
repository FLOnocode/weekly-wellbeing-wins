import { Link } from "react-router-dom";
import { ArrowLeft, BarChart, TrendingUp, Calendar, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { challengeService, supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Analytics = () => {
  const { user, profile } = useAuth();
  const [dailyChallengeData, setDailyChallengeData] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    totalPoints: 0,
    averageDaily: 0,
    bestDay: 0
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6); // Last 7 days including today

        const startDate = format(sevenDaysAgo, 'yyyy-MM-dd');
        const endDate = format(today, 'yyyy-MM-dd');

        // Récupérer les données des défis quotidiens
        const dailyCounts = await challengeService.getDailyChallengeCount(user.id, startDate, endDate);
        
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

    fetchAnalyticsData();
  }, [user]);

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
          totalPoints={stats.totalPoints}
          completedChallenges={stats.totalChallenges}
          totalChallenges={7}
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
                  <BarChart className="h-5 w-5 text-wellness-500" />
                  <span>Défis complétés par jour</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center text-white/70 py-8">Chargement des données...</div>
                ) : (
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
                      <Bar dataKey="challenges" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
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
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;