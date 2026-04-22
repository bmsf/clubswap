import { motion } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/16/solid'
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
            <div className="relative flex h-3.5 w-3.5 items-center justify-center">
              {i === currentStep && (
                <span className="bg-primary/25 absolute inset-0 animate-ping rounded-full" />
              )}
              <motion.button
                type="button"
                onClick={() => i < currentStep && onGaTil(i)}
                className={cn(
                  'relative flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors duration-300',
                  i < currentStep
                    ? 'bg-primary cursor-pointer'
                    : i === currentStep
                      ? 'bg-primary'
                      : 'bg-muted cursor-default'
                )}
                whileTap={i < currentStep ? { scale: 0.9 } : {}}
              >
                {i < currentStep && <CheckIcon className="h-2.5 w-2.5 text-white" />}
              </motion.button>
            </div>
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
