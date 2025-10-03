import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Drawer = ({ open, onClose, title, children }: DrawerProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex justify-end bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#10152B] p-6 shadow-neon"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-accent">{title}</h2>
              <button className="focus-ring rounded-full p-2 hover:bg-accent/10" onClick={onClose} aria-label="閉じる">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-white/70">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
