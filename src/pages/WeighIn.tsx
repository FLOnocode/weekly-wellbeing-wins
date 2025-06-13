import { useState } from "react";
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

const WeighIn = () => {
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setWeight("");
      setPhoto(null);
      setNotes("");
      alert("Pesée enregistrée avec succès !");
    }, 1500);
  };

  const nextWeighInDate = new Date();
  nextWeighInDate.setDate(nextWeighInDate.getDate() + ((1 - nextWeighInDate.getDay() + 7) % 7));

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
                      placeholder="Entrez votre poids"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo" className="text-body font-medium text-white">Photo de preuve</Label>
                    <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                      {photo ? (
                        <div className="space-y-2">
                          <div className="text-body-sm text-wellness-300 font-medium">Photo sélectionnée : {photo.name}</div>
                          <Button type="button" variant="outline" size="sm" onClick={() => setPhoto(null)} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                            Supprimer la photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="h-8 w-8 text-white/60 mx-auto" />
                          <div className="text-body-sm text-white/70">Prenez une photo de votre balance</div>
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
                    {isSubmitting ? "Envoi en cours..." : "Enregistrer la pesée"}
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
                <div className="space-y-3">
                  {[
                    { date: "2025-01-20", weight: 72.5, change: -0.8, points: 15 },
                    { date: "2025-01-13", weight: 73.3, change: -1.2, points: 20 },
                    { date: "2025-01-06", weight: 74.5, change: -0.5, points: 10 },
                  ].map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                      <div>
                        <div className="text-body font-medium text-white">{entry.weight}kg</div>
                        <div className="text-body-sm text-white/70">{new Date(entry.date).toLocaleDateString("fr-FR")}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-body font-medium ${entry.change < 0 ? "text-wellness-300" : "text-red-300"}`}>
                          {entry.change > 0 ? "+" : ""}
                          {entry.change}kg
                        </div>
                        <div className="text-body-sm text-motivation-300">+{entry.points} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeighIn;