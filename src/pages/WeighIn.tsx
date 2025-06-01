
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
    <div className="min-h-screen bg-gradient-to-br from-wellness-50 via-white to-motivation-50">
      <MobileHeader 
        totalPoints={0}
        completedChallenges={0}
        totalChallenges={7}
      />

      <div className="pt-20 pb-6">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header avec retour */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-wellness-600">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-heading-2 font-bold text-gradient">Mon Poids</h1>
              <p className="text-body text-gray-600">Suivez votre progression</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Prochaine pesée */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4">
                  <Calendar className="h-5 w-5 text-motivation-500" />
                  <span>Pesée Hebdomadaire</span>
                </CardTitle>
                <CardDescription>
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
                  <Badge className="bg-wellness-100 text-wellness-700 hover:bg-wellness-200">
                    Pesées le lundi
                  </Badge>
                  <Badge className="bg-motivation-100 text-motivation-700 hover:bg-motivation-200">
                    Photo obligatoire
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Formulaire de pesée */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-heading-4">
                  <Scale className="h-5 w-5 text-wellness-500" />
                  <span>Enregistrer votre poids</span>
                </CardTitle>
                <CardDescription>Soumettez votre pesée hebdomadaire avec photo</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-body font-medium">Poids actuel (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Entrez votre poids"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                      className="border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo" className="text-body font-medium">Photo de preuve</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {photo ? (
                        <div className="space-y-2">
                          <div className="text-body-sm text-wellness-600 font-medium">Photo sélectionnée : {photo.name}</div>
                          <Button type="button" variant="outline" size="sm" onClick={() => setPhoto(null)}>
                            Supprimer la photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="h-8 w-8 text-gray-400 mx-auto" />
                          <div className="text-body-sm text-gray-600">Prenez une photo de votre balance</div>
                          <label htmlFor="photo-input" className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" asChild>
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
                    <Label htmlFor="notes" className="text-body font-medium">Notes (Optionnel)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Comment vous sentez-vous ? Des défis cette semaine ?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="border-gray-200"
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
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-heading-4">Pesées récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "2025-01-20", weight: 72.5, change: -0.8, points: 15 },
                    { date: "2025-01-13", weight: 73.3, change: -1.2, points: 20 },
                    { date: "2025-01-06", weight: 74.5, change: -0.5, points: 10 },
                  ].map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-wellness-50 to-motivation-50 rounded-lg">
                      <div>
                        <div className="text-body font-medium text-gray-900">{entry.weight}kg</div>
                        <div className="text-body-sm text-gray-600">{new Date(entry.date).toLocaleDateString("fr-FR")}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-body font-medium ${entry.change < 0 ? "text-wellness-600" : "text-red-600"}`}>
                          {entry.change > 0 ? "+" : ""}
                          {entry.change}kg
                        </div>
                        <div className="text-body-sm text-motivation-600">+{entry.points} pts</div>
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
