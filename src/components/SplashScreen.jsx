import React from 'react'
import { motion } from 'framer-motion'
import logo from '../../assets/logo.png'

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
          className="splash-logo-container"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
        >
          <img 
            src={logo} 
            alt="Nossas Iniciais" 
            className="splash-logo"
          />
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
