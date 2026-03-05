import React from 'react'
import { motion } from 'framer-motion'
import { Heart, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

export function MemoryCard({ memory, onPress, onLongPress, onOptionsClick, onEditMemory, onDeleteMemory }) {
  const { toggleFavorite } = useApp()
  const [isFavorite, setIsFavorite] = React.useState(memory.is_favorite || false)
  const [showActions, setShowActions] = React.useState(false)

  const handleFavoriteClick = async (e) => {
    e.stopPropagation()
    try {
      await toggleFavorite(memory.id, isFavorite)
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Erro ao favoritação:', error)
    }
  }

  const handleOptionsClick = (e) => {
    e.stopPropagation()
    setShowActions(!showActions)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setShowActions(false)
    if (onEditMemory) {
      onEditMemory(memory)
    }
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setShowActions(false)
    if (onDeleteMemory) {
      onDeleteMemory(memory)
    }
  }

  return (
    <motion.div
      className="memory-card"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -5, boxShadow: '0 15px 40px rgba(183, 110, 121, 0.25)' }}
      onClick={onPress}
    >
      <div className="polaroid-wrapper">
        <div className="polaroid-image-container">
          <img
            src={memory.image_url}
            alt="Memória nossa"
            className="polaroid-image"
            loading="lazy"
          />
          <motion.button
            key={`favorite-${memory.id}-${isFavorite}`}
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title={isFavorite ? 'Remover de favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'heart-filled' : 'heart-outline'} />
          </motion.button>
          <div className="options-wrapper">
            <motion.button
              className="options-btn"
              onClick={handleOptionsClick}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title="Opções"
            >
              <MoreVertical size={22} />
            </motion.button>
            {/* Floating Actions Menu */}
            {showActions && (
              <motion.div 
                className="floating-actions"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                <motion.button 
                  className="floating-action edit" 
                  onClick={handleEdit}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Pencil size={20} />
                </motion.button>
                <motion.button 
                  className="floating-action delete" 
                  onClick={handleDelete}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Trash2 size={20} />
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="polaroid-caption">
          {memory.caption || 'Sem legenda'}
        </div>
        
        <div className="polaroid-date">
          {new Date(memory.created_at).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>
    </motion.div>
  )
}

export function AddMemoryCard({ onClick }) {
  return (
    <motion.div
      className="memory-card add-card"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -5, boxShadow: '0 15px 40px rgba(183, 110, 121, 0.25)' }}
      onClick={onClick}
    >
      <div className="add-card-content">
        <div className="add-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <span className="add-text">Adicionar nova memória</span>
        <span className="add-hint">Toque para adicionar uma foto</span>
      </div>
    </motion.div>
  )
}
