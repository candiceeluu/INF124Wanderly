// ============================================================================
// PageTransition.jsx — Reusable wrapper that fades + slides a page in/out.
// Every authenticated page wraps its root element with this so route changes
// feel smooth. Works in tandem with the <AnimatePresence> in App.jsx.
// ============================================================================
import { motion } from 'framer-motion'

// PageTransition — children are rendered inside a motion.div with
// enter/exit animations. `initial` fires when mounted, `exit` when unmounted.
export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
