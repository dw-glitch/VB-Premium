import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'

export function AnniversaryNotification() {
  const { daysTogether } = useApp()
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const handleAnniversary = () => {
      setShowNotification(true)
      // Auto-fechar após 5 segundos
      setTimeout(() => {
        setShowNotification(false)
      }, 5000)
    }

    window.addEventListener('anniversary', handleAnniversary)
    
    // Verificar se é o dia do aniversário ao carregar
    const checkAnniversary = () => {
      const notificationShown = localStorage.getItem('anniversaryNotificationShown')
      const today = new Date().toDateString()
      
      if (notificationShown !== today) {
        // Verificar se é o dia do aniversário
        const diaryStartDate = new Date(localStorage.getItem('diaryStartDate') || '2026-02-22')
        const today = new Date()
        
        if (today.getDate() === diaryStartDate.getDate() && 
            today.getMonth() === diaryStartDate.getMonth()) {
          localStorage.setItem('anniversaryNotificationShown', today)
          setShowNotification(true)
          setTimeout(() => {
            setShowNotification(false)
          }, 5000)
        }
      }
    }
    
    // small delay to ensure context is loaded
    setTimeout(checkAnniversary, 500)

    return () => {
      window.removeEventListener('anniversary', handleAnniversary)
    }
  }, [])

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          className="anniversary-notification"
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="notification-content">
            <motion.div
              className="notification-icon"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              🎉💕🎉
            </motion.div>
            <div className="notification-text">
              <h3>Feliz Aniversário de Namoro! 💕</h3>
              <p>Vocês estão juntos há <strong>{daysTogether}</strong> dias!</p>
            </div>
            <button 
              className="notification-close"
              onClick={() => setShowNotification(false)}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
