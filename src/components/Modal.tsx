import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal = ({ open, onClose, title, children, footer }: ModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl border border-accent/40 bg-[#10152B] p-6 shadow-neon"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold text-accent">{title}</h2>
            </div>
            <div className="space-y-4 text-sm text-white/70">{children}</div>
            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
            <button className="sr-only" aria-label="閉じる" onClick={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
