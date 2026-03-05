import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

export function DaysCounter() {
  const { daysTogether, daysToAnniversary, diaryStartDate } = useApp()
  const [isExpanded, setIsExpanded] = useState(false)

  const nextAnniversary = new Date(diaryStartDate)
  const now = new Date()
  const currentYear = now.getFullYear()
  let anniversaryDate = new Date(currentYear, diaryStartDate.getMonth(), diaryStartDate.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (anniversaryDate < today) {
    anniversaryDate = new Date(currentYear + 1, diaryStartDate.getMonth(), diaryStartDate.getDate())
  }
  const day = anniversaryDate.getDate()
  const month = anniversaryDate.getMonth() + 1

  // Calcular anos, meses e dias detalhados
  const calculateDetailedTime = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const start = new Date(diaryStartDate.getFullYear(), diaryStartDate.getMonth(), diaryStartDate.getDate())
    
    let years = today.getFullYear() - start.getFullYear()
    let months = today.getMonth() - start.getMonth()
    let days = today.getDate() - start.getDate()
    
    if (days < 0) {
      months--
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += prevMonth.getDate()
    }
    
    if (months < 0) {
      years--
      months += 12
    }
    
    return { years, months, days: days + 1 }
  }

  const detailed = calculateDetailedTime()

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <motion.div 
      className="days-counter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="counter-card"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ cursor: 'pointer' }}
      >
        <motion.div 
          className="counter-icon" 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ duration: 2, repeat: Infinity }}
        >
          💕
        </motion.div>

        <div className="counter-content">
          <motion.div 
            className="counter-big"
            key={daysTogether}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {daysTogether}
          </motion.div>
          <div className="counter-label">dias juntos</div>
        </div>

        <div className="counter-date">
          {formatDate(diaryStartDate)}
        </div>

        {/* Detalhes expandidos */}
        <motion.div 
          className="counter-details"
          initial={false}
          animate={{ 
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-number">{detailed.years}</span>
              <span className="detail-label">anos</span>
            </div>
            <div className="detail-separator" />
            <div className="detail-item">
              <span className="detail-number">{detailed.months}</span>
              <span className="detail-label">meses</span>
            </div>
            <div className="detail-separator" />
            <div className="detail-item">
              <span className="detail-number">{detailed.days}</span>
              <span className="detail-label">dias</span>
            </div>
          </div>
          <div className="counter-next">
            <span className="next-label">Próximo aniversário</span>
            <span className="next-date">{day}/{month}</span>
            <span className="next-days">{daysToAnniversary} dias</span>
          </div>
        </motion.div>

        {!isExpanded && (
          <div className="tap-hint">Toque para ver detalhes</div>
        )}
      </motion.div>
    </motion.div>
  )
}
