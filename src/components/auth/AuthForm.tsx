import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { Heart, Mail, Lock, User } from 'lucide-react'
import { motion } from 'framer-motion'

export const AuthForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('signin')
  const { signIn, signUp } = useAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
    } else {
      // Après inscription réussie, l'utilisateur sera automatiquement connecté
      // et redirigé vers l'onboarding grâce à la logique dans App.tsx
      console.log('✅ Inscription réussie, redirection vers onboarding...')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Effets de fond avec bleu marine */}
      <div className="absolute inset-0 bg-gradient-to-b from-oceanblue-400/20 via-oceanblue-700/30 to-black" />
      
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-oceanblue-400/20 blur-[80px]" />
      <motion.div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-oceanblue-300/20 blur-[60px]"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-medium mb-4">
            <Heart className="h-4 w-4 text-oceanblue-400" />
            Challenge Wellness Weekly
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">
            Bienvenue
          </h1>
          
          <p className="text-white/70 leading-relaxed">
            {activeTab === 'signin' 
              ? 'Connectez-vous pour continuer votre transformation'
              : 'Créez votre compte et commencez votre transformation'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="glassmorphism">
            <CardHeader className="text-center">
              <CardTitle className="text-white">
                {activeTab === 'signin' ? 'Connexion' : 'Créer un compte'}
              </CardTitle>
              <CardDescription className="text-white/70">
                {activeTab === 'signin' 
                  ? 'Accédez à votre espace personnel'
                  : 'Rejoignez le défi et transformez-vous'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger value="signin" className="text-white data-[state=active]:bg-white/20">
                    Se connecter
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-white data-[state=active]:bg-white/20">
                    S'inscrire
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-white">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-white">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="text-red-300 text-sm text-center p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-oceanblue-500 to-motivation-500 text-white"
                    >
                      {loading ? 'Connexion...' : 'Se connecter'}
                    </Button>

                    <div className="text-center">
                      <p className="text-white/60 text-sm">
                        Pas encore de compte ?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('signup')}
                          className="text-oceanblue-300 hover:text-oceanblue-200 underline"
                        >
                          Créez-en un
                        </button>
                      </p>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-white">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-white">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <p className="text-xs text-white/50">
                        Minimum 6 caractères
                      </p>
                    </div>

                    {error && (
                      <div className="text-red-300 text-sm text-center p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-oceanblue-500 to-motivation-500 text-white"
                    >
                      {loading ? 'Création...' : 'Créer mon compte'}
                    </Button>

                    <div className="text-center">
                      <p className="text-white/60 text-sm">
                        Déjà un compte ?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('signin')}
                          className="text-oceanblue-300 hover:text-oceanblue-200 underline"
                        >
                          Connectez-vous
                        </button>
                      </p>
                    </div>

                    <div className="p-3 bg-oceanblue-500/10 border border-oceanblue-400/30 rounded-lg">
                      <p className="text-xs text-oceanblue-200 text-center">
                        En créant un compte, vous rejoignez le Challenge Wellness Weekly et acceptez de participer au défi de transformation.
                      </p>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}