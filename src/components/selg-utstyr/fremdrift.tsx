import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Fremdrift({
  steg,
  currentStep,
  onGaTil,
}: {
  steg: { id: string; tittel: string }[]
  currentStep: number
  onGaTil: (i: number) => void
}) {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-3 flex justify-between">
        {steg.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center">
            <motion.button
              type="button"
              onClick={() => i < currentStep && onGaTil(i)}
              className={cn(
                'h-3.5 w-3.5 rounded-full transition-colors duration-300',
                i < currentStep
                  ? 'bg-primary cursor-pointer'
                  : i === currentStep
                    ? 'bg-primary ring-primary/20 ring-4'
                    : 'bg-muted cursor-default'
              )}
              whileTap={i < currentStep ? { scale: 0.9 } : {}}
            />
            <span
              className={cn(
                'mt-1.5 hidden text-xs sm:block',
                i === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
              )}
            >
              {s.tittel}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
        <motion.div
          className="bg-primary h-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (steg.length - 1)) * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  )
}
