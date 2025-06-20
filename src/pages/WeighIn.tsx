import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Scale, Calendar, Upload, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/MobileHeader";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, WeightEntry } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";

const WeighIn = () => {
  const { profile, updateProfile, user, refreshProfile } = useAuth();
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentWeighIns, setRecentWeighIns] = useState<WeightEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Charger l'historique des pesées
  useEffect(() => {
    const fetchWeightHistory = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('weight_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Erreur lors du chargement de l\'historique:', error);
        } else {
          setRecentWeighIns(data || []);
        }
      } catch (error) {
        console.error('Exception lors du chargement de l\'historique:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchWeightHistory();
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo ne doit pas dépasser 5MB");
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image valide");
        return;
      }

      setPhoto(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('📸 Upload de la photo:', fileName);

      // Uploader le fichier vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('weight-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Erreur upload photo:', error);
        throw error;
      }

      console.log('✅ Photo uploadée:', data);

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('weight-photos')
        .getPublicUrl(fileName);

      console.log('🔗 URL publique:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('💥 Exception upload photo:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vous devez être connecté pour enregistrer une pesée");
      return;
    }

    if (!weight || parseFloat(weight) <= 0) {
      toast.error("Veuillez entrer un poids valide");
      return;
    }

    if (!photo) {
      toast.error("Une photo de preuve est obligatoire");
      return;
    }

    setIsSubmitting(true);

    try {
      const weightValue = parseFloat(weight);
      let photoUrl: string | null = null;

      // 1. Uploader la photo si elle existe
      if (photo) {
        toast.loading("Upload de la photo en cours...");
        photoUrl = await uploadPhoto(photo);
        
        if (!photoUrl) {
          throw new Error("Échec de l'upload de la photo");
        }
      }

      // 2. Mettre à jour le poids actuel dans le profil
      toast.loading("Mise à jour du profil...");
      const { error: profileError } = await updateProfile({
        current_weight: weightValue
      });

      if (profileError) {
        throw profileError;
      }

      // 3. Enregistrer l'entrée de poids dans weight_entries
      toast.loading("Enregistrement de la pesée...");
      const { data: weightEntry, error: weightError } = await supabase
        .from('weight_entries')
        .insert({
          user_id: user.id,
          weight: weightValue,
          photo_url: photoUrl,
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (weightError) {
        throw weightError;
      }

      console.log('✅ Pesée enregistrée:', weightEntry);

      // 4. Rafraîchir le profil et l'historique
      await refreshProfile();
      
      // Recharger l'historique
      const { data: updatedHistory } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (updatedHistory) {
        setRecentWeighIns(updatedHistory);
      }

      // 5. Réinitialiser le formulaire
      setWeight("");
      setPhoto(null);
      setNotes("");

      toast.success("Pesée enregistrée avec succès ! 🎉");

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      
      let errorMessage = "Erreur lors de l'enregistrement de la pesée";
      
      if (error.message?.includes('storage')) {
        errorMessage = "Erreur lors de l'upload de la photo";
      } else if (error.message?.includes('profiles')) {
        errorMessage = "Erreur lors de la mise à jour du profil";
      } else if (error.message?.includes('weight_entries')) {
        errorMessage = "Erreur lors de l'enregistrement de la pesée";
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextWeighInDate = new Date();
  nextWeighInDate.setDate(nextWeighInDate.getDate() + ((1 - nextWeighInDate.getDay() + 7) % 7));

  const calculateWeightChange = (currentWeight: number, previousWeight?: number) => {
    if (!previousWeight) return 0;
    return currentWeight - previousWeight;
  };

  const calculatePoints = (weightChange: number) => {
    // 15 points par kg perdu
    if (weightChange < 0) {
      return Math.round(Math.abs(weightChange) * 15);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Effets de fond similaires à la page principale */}
      <div className="absolute inset-0 bg-gradient-to-b from-wellness-500/20 via-wellness-700/30 to-black" />
      
      {/* Texture de bruit subtile */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Lueur radiale du haut */}
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

      {/* Spots lumineux animés */}
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <div className="relative z-20">
        <MobileHeader 
          totalPoints={0}
          completedChallenges={0}
          totalChallenges={7}
        />
      </div>

      <div className="relative z-10 pt-20 pb-6">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header avec retour */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-heading-2 font-bold text-gradient">Mon Poids</h1>
              <p className="text-body text-white/70">Suivez votre progression</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Informations du profil */}
            {profile && (
              <Card className="glassmorphism border-wellness-400/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                    <Scale className="h-5 w-5 text-wellness-500" />
                    <span>Votre profil - {profile.nickname}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/10 backdrop-blur-sm border border-wellness-400/30 rounded-lg">
                      <div className="text-heading-3 font-bold text-wellness-300">
                        {profile.current_weight > 0 ? `${profile.current_weight}kg` : 'Non défini'}
                      </div>
                      <div className="text-body-sm text-white/70">Poids actuel</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 backdrop-blur-sm border border-motivation-400/30 rounded-lg">
                      <div className="text-heading-3 font-bold text-motivation-300">
                        {profile.goal_weight > 0 ? `${profile.goal_weight}kg` : 'Non défini'}
                      </div>
                      <div className="text-body-sm text-white/70">Objectif</div>
                    </div>
                  </div>
                  
                  {profile.current_weight > 0 && profile.goal_weight > 0 && (
                    <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-center">
                      <div className="text-body-sm text-white/70 mb-1">Reste à perdre</div>
                      <div className="text-heading-4 font-bold text-white">
                        {Math.max(0, profile.current_weight - profile.goal_weight).toFixed(1)}kg
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Prochaine pesée */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                  <Calendar className="h-5 w-5 text-motivation-500" />
                  <span>Pesée Hebdomadaire</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Prochaine pesée : {" "}
                  {nextWeighInDate.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-wellness-500/20 text-wellness-200 border-wellness-400/30">
                    Pesées le lundi
                  </Badge>
                  <Badge className="bg-motivation-500/20 text-motivation-200 border-motivation-400/30">
                    Photo obligatoire
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Formulaire de pesée */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4 text-white">
                  <Scale className="h-5 w-5 text-wellness-500" />
                  <span>Enregistrer votre poids</span>
                </CardTitle>
                <CardDescription className="text-white/70">Soumettez votre pesée hebdomadaire avec photo</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-body font-medium text-white">Poids actuel (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder={profile?.current_weight ? `Actuel: ${profile.current_weight}kg` : "Entrez votre poids"}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo" className="text-body font-medium text-white">Photo de preuve *</Label>
                    <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                      {photo ? (
                        <div className="space-y-2">
                          <div className="text-body-sm text-wellness-300 font-medium">Photo sélectionnée : {photo.name}</div>
                          <div className="text-xs text-white/60">Taille: {(photo.size / 1024 / 1024).toFixed(2)} MB</div>
                          <Button type="button" variant="outline" size="sm" onClick={() => setPhoto(null)} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                            Supprimer la photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="h-8 w-8 text-white/60 mx-auto" />
                          <div className="text-body-sm text-white/70">Prenez une photo de votre balance</div>
                          <div className="text-xs text-white/50">Max 5MB - JPG, PNG acceptés</div>
                          <label htmlFor="photo-input" className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" asChild className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Choisir une photo
                              </span>
                            </Button>
                          </label>
                        </div>
                      )}
                      <input
                        id="photo-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoChange}
                        className="hidden"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-body font-medium text-white">Notes (Optionnel)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Comment vous sentez-vous ? Des défis cette semaine ?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-wellness-500 to-motivation-500 hover:from-wellness-600 hover:to-motivation-600 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enregistrement en cours..." : "Enregistrer la pesée"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Pesées récentes */}
            <Card className="glassmorphism">
              <CardHeader className="pb-4">
                <CardTitle className="text-heading-4 text-white">Pesées récentes</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center text-white/70 py-4">
                    Chargement de l'historique...
                  </div>
                ) : recentWeighIns.length > 0 ? (
                  <div className="space-y-3">
                    {recentWeighIns.map((entry, index) => {
                      const previousWeight = index < recentWeighIns.length - 1 ? recentWeighIns[index + 1].weight : undefined;
                      const weightChange = calculateWeightChange(entry.weight, previousWeight);
                      const points = calculatePoints(weightChange);

                      return (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                          <div>
                            <div className="text-body font-medium text-white">{entry.weight}kg</div>
                            <div className="text-body-sm text-white/70">
                              {new Date(entry.created_at).toLocaleDateString("fr-FR")}
                            </div>
                            {entry.notes && (
                              <div className="text-xs text-white/60 mt-1 max-w-40 truncate">
                                {entry.notes}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {previousWeight && (
                              <div className={`text-body font-medium ${weightChange < 0 ? "text-wellness-300" : weightChange > 0 ? "text-red-300" : "text-white/70"}`}>
                                {weightChange > 0 ? "+" : ""}
                                {weightChange.toFixed(1)}kg
                              </div>
                            )}
                            {points > 0 && (
                              <div className="text-body-sm text-motivation-300">+{points} pts</div>
                            )}
                            {entry.photo_url && (
                              <div className="text-xs text-wellness-300 mt-1">📸 Photo</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-white/70 py-4">
                    Aucune pesée enregistrée pour le moment
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeighIn;