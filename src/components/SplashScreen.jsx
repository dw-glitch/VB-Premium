import React from 'react'
import { motion } from 'framer-motion'

export function SplashScreen({ onStart }) {
  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="splash-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          className="splash-icon"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
        >
          <svg viewBox="0 0 100 100" className="heart-icon">
            <motion.path
              d="M50 88 C20 60 5 40 5 25 C5 12 15 5 25 5 C33 5 40 10 50 18 C60 10 67 5 75 5 C85 5 95 12 95 25 C95 40 80 60 50 88Z"
              fill="none"
              stroke="var(--rosa-premium)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
            />
            <motion.path
              d="M50 88 C20 60 5 40 5 25 C5 12 15 5 25 5 C33 5 40 10 50 18 C60 10 67 5 75 5 C85 5 95 12 95 25 C95 40 80 60 50 88Z"
              fill="var(--rosa-interactive)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            />
          </svg>
        </motion.div>

        <motion.h1
          className="splash-title"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Nossa História
        </motion.h1>

        <motion.p
          className="splash-subtitle"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          Um espaço onde cada momento se transforma em memória.
          <br />
          <br />
          Nossa história, registrada em cada detalhe.
        </motion.p>

        <motion.div
          className="splash-date"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          Desde 21 de fevereiro de 2026
        </motion.div>

        <motion.button
          className="splash-button"
          onClick={onStart}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Entrar</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
