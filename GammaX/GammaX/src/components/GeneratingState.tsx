import { Sparkle, Image, Lightning, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

const steps = [
  { icon: Lightning, label: 'Analyzing prompt', delay: 0 },
  { icon: Sparkle, label: 'Generating content', delay: 0.2 },
  { icon: Image, label: 'Creating visuals', delay: 0.4 },
  { icon: CheckCircle, label: 'Finalizing slides', delay: 0.6 }
]

export function GeneratingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 blur-3xl"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-primary to-accent" />
          </motion.div>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="relative"
          >
            <Sparkle className="w-20 h-20 text-primary mx-auto" weight="fill" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-foreground mb-3"
        >
          Creating Your Presentation
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground mb-8"
        >
          Our AI is crafting beautiful slides with stunning visuals
        </motion.p>

        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay }}
              className="flex items-center gap-3 justify-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: "easeInOut"
                }}
              >
                <step.icon className="w-5 h-5 text-primary" weight="fill" />
              </motion.div>
              <span className="text-sm text-foreground font-medium">{step.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <div className="h-2 bg-secondary/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 8,
                ease: "easeInOut"
              }}
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
              style={{
                backgroundSize: "200% 100%"
              }}
            >
              <motion.div
                animate={{ x: ["0%", "200%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="h-full w-1/3 bg-white/30"
              />
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Generating images and formatting content...
          </p>
        </motion.div>
      </div>
    </div>
  )
}
