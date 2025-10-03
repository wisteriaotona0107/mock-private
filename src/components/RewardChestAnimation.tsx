import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface RewardChestAnimationProps {
  title: string;
  description: string;
}

export const RewardChestAnimation = ({ title, description }: RewardChestAnimationProps) => {
  return (
    <div className="relative flex flex-col items-center gap-4">
      <motion.div
        className="relative flex h-32 w-40 items-center justify-center rounded-2xl border border-milestone/50 bg-gradient-to-br from-milestone/40 to-transparent"
        initial={{ scale: 0.95 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
      >
        <motion.div
          className="absolute inset-1 rounded-2xl border border-white/20 bg-[#0B1020]/90"
          initial={{ boxShadow: '0 0 0px rgba(241,196,15,0.3)' }}
          animate={{ boxShadow: ['0 0 20px rgba(241,196,15,0.3)', '0 0 35px rgba(241,196,15,0.6)', '0 0 20px rgba(241,196,15,0.3)'] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Sparkles className="mb-2 text-milestone" size={32} />
          <p className="text-sm font-semibold text-milestone">{title}</p>
          <p className="text-xs text-white/60">{description}</p>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute -top-6 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {[...Array(3)].map((_, index) => (
          <Sparkles key={index} className="text-accent" size={18} />
        ))}
      </motion.div>
    </div>
  );
};
