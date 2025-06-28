import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackForm = ({ isOpen, onClose }: FeedbackFormProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vous devez être connecté pour envoyer un feedback");
      return;
    }

    if (!message.trim()) {
      toast.error("Veuillez écrire votre message");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Envoi du feedback:', {
        userId: user.id,
        messageLength: message.trim().length
      });

      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          message: message.trim()
        });

      if (error) {
        console.error('❌ Erreur lors de l\'envoi du feedback:', error);
        throw error;
      }

      console.log('✅ Feedback envoyé avec succès');
      
      // Afficher l'animation de succès
      setIsSuccess(true);
      
      // Réinitialiser le formulaire après un délai
      setTimeout(() => {
        setMessage("");
        setIsSuccess(false);
        onClose();
        toast.success("Merci pour votre feedback ! 🙏");
      }, 2000);

    } catch (error: any) {
      console.error('💥 Exception lors de l\'envoi du feedback:', error);
      toast.error(`Erreur lors de l'envoi: ${error.message || "Erreur inconnue"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isSuccess) {
      setMessage("");
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-black/90 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <MessageSquare className="h-6 w-6 text-motivation-400" />
            Votre Feedback
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Partagez vos idées, suggestions ou problèmes pour améliorer l'application
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="py-8"
            >
              <Card className="glassmorphism border-wellness-400/30">
                <CardContent className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.2, 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 10 
                    }}
                    className="mb-4"
                  >
                    <CheckCircle className="h-16 w-16 text-wellness-400 mx-auto" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-xl font-bold text-wellness-300 mb-2">
                      Merci pour votre contribution !
                    </h3>
                    <p className="text-white/80 text-sm">
                      Votre feedback a été envoyé avec succès. Il nous aidera à améliorer l'application.
                    </p>
                  </motion.div>

                  {/* Animation de particules */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-wellness-400 rounded-full"
                        initial={{ 
                          opacity: 0,
                          x: "50%",
                          y: "50%",
                          scale: 0
                        }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          x: `${50 + (Math.random() - 0.5) * 200}%`,
                          y: `${50 + (Math.random() - 0.5) * 200}%`,
                          scale: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 1.5,
                          delay: 0.5 + i * 0.1,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="feedback-message" className="text-white">
                  Votre message
                </Label>
                <Textarea
                  id="feedback-message"
                  placeholder="Décrivez votre expérience, vos suggestions d'amélioration, ou signalez un problème..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between text-xs text-white/50">
                  <span>Soyez constructif et précis</span>
                  <span>{message.length}/1000</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Annuler
                </Button>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full bg-gradient-to-r from-motivation-500 to-wellness-500 hover:from-motivation-600 hover:to-wellness-600 text-white relative overflow-hidden"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              <div className="p-3 bg-motivation-500/10 border border-motivation-400/30 rounded-lg">
                <p className="text-xs text-motivation-200 text-center">
                  💡 Votre feedback est anonymisé et nous aide à améliorer l'expérience pour tous
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};