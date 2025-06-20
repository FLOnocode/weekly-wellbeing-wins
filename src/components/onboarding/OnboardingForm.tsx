import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { User, Target, Scale, ArrowRight, ArrowLeft, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export const OnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [nickname, setNickname] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [currentWeight, setCurrentWeight] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { updateProfile, signOut, user } = useAuth()

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      // La redirection vers AuthForm se fera automatiquement via AuthContext
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      setIsLoggingOut(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const { error } = await updateProfile({
      nickname,
      goal_weight: parseFloat(goalWeight),
      current_weight: parseFloat(currentWeight),
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return nickname.trim().length >= 2
      case 2:
        return goalWeight && parseFloat(goalWeight) > 0
      case 3:
        return currentWeight && parseFloat(currentWeight) > 0
      default:
        return false
    }
  }

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Effets de fond */}
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

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Bouton de déconnexion en haut à droite */}
        <div className="absolute top-0 right-0 z-20">
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? "..." : "Changer d'utilisateur"}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-3">
            Configuration de votre profil
          </h1>
          
          <p className="text-white/70 leading-relaxed mb-2">
            Quelques informations pour personnaliser votre expérience
          </p>

          {/* Affichage de l'utilisateur connecté */}
          {user && (
            <div className="text-xs text-white/50 mb-4 p-2 bg-white/5 rounded-lg">
              Connecté en tant que : {user.email}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/70">
              <span>Étape {currentStep} sur {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        </motion.div>

        <Card className="glassmorphism">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-wellness-500/20 rounded-full mb-4">
                      <User className="h-8 w-8 text-wellness-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Votre surnom</h2>
                    <p className="text-white/70 text-sm">
                      Choisissez un surnom qui vous représente dans le challenge
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-white">Surnom</Label>
                    <Input
                      id="nickname"
                      type="text"
                      placeholder="Ex: SuperMotivé2025"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      maxLength={20}
                    />
                    <p className="text-xs text-white/50">
                      {nickname.length}/20 caractères
                    </p>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-motivation-500/20 rounded-full mb-4">
                      <Target className="h-8 w-8 text-motivation-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Votre objectif</h2>
                    <p className="text-white/70 text-sm">
                      Quel est votre poids objectif pour ce challenge ?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goalWeight" className="text-white">Poids objectif (kg)</Label>
                    <Input
                      id="goalWeight"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 70.5"
                      value={goalWeight}
                      onChange={(e) => setGoalWeight(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-energy-500/20 rounded-full mb-4">
                      <Scale className="h-8 w-8 text-energy-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Votre poids actuel</h2>
                    <p className="text-white/70 text-sm">
                      Indiquez votre poids de départ pour suivre vos progrès
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentWeight" className="text-white">Poids actuel (kg)</Label>
                    <Input
                      id="currentWeight"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 75.2"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  {error && (
                    <div className="text-red-300 text-sm text-center p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      {error}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-wellness-500 to-motivation-500 text-white"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  className="bg-gradient-to-r from-wellness-500 to-motivation-500 text-white"
                >
                  {loading ? 'Finalisation...' : 'Terminer'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Aide pour les utilisateurs de test */}
        <div className="mt-6 text-center">
          <div className="text-xs text-white/40 p-3 bg-white/5 rounded-lg">
            💡 Pour tester avec un autre utilisateur, cliquez sur "Changer d'utilisateur" en haut à droite
          </div>
        </div>
      </div>
    </div>
  )
}