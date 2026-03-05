import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { MemoryCard, AddMemoryCard } from './MemoryCard'
import { MemoryActions } from './MemoryActions'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export function PhotoCarousel({ onEditClick, onEditMemory, onDeleteMemory }) {
  const { memories } = useApp()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [swipeDirection, setSwipeDirection] = useState(null)
  const [showActions, setShowActions] = useState(false)
  const longPressTimer = useRef(null)

  const totalSlides = memories.length
  const hasPhotos = totalSlides > 0

  const handlePreviousClick = () => {
    if (currentIndex > 0) {
      setSwipeDirection('left')
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleNextClick = () => {
    if (currentIndex < totalSlides) {
      setSwipeDirection('right')
      setCurrentIndex((prev) => prev + 1)
    }
  }

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.changedTouches[0].screenX)
  }

  const handleTouchEnd = (e) => {
    if (!touchStart) return

    const touchEnd = e.changedTouches[0].screenX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNextClick()
      } else {
        handlePreviousClick()
      }
    }
  }

  // Long press for actions
  const handleMemoryPress = (memory) => {
    longPressTimer.current = setTimeout(() => {
      setShowActions(true)
    }, 500)
  }

  const handleMemoryRelease = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const handleEdit = () => {
    const currentMemory = memories[currentIndex]
    if (currentMemory) {
      onEditClick(currentMemory)
    }
  }

  const handleDelete = () => {
    const currentMemory = memories[currentIndex]
    if (currentMemory) {
      onEditClick({ ...currentMemory, delete: true })
    }
  }

  if (!hasPhotos) {
    return (
      <div className="carousel-empty">
        <div className="empty-icon">📸</div>
        <p>Nenhuma foto ainda.</p>
        <p className="empty-hint">Adicione uma para começar nossa história!</p>
      </div>
    )
  }

  const currentPhoto = memories[currentIndex]
  const isOnLastSlide = currentIndex === totalSlides - 1
  const showAddCard = currentIndex === totalSlides

  return (
    <>
      <div className="carousel-wrapper">
        <div
          className="carousel"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            {!showAddCard ? (
              <MemoryCard
                key={currentPhoto.id}
                memory={currentPhoto}
                onPress={handleMemoryRelease}
                onLongPress={() => setShowActions(true)}
                onOptionsClick={() => setShowActions(true)}
                onEditMemory={onEditMemory}
                onDeleteMemory={onDeleteMemory}
              />
            ) : (
              <AddMemoryCard
                key="add-card"
                onClick={() => onEditClick({ addNew: true })}
              />
            )}
          </AnimatePresence>

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <motion.button
              className="nav-button prev"
              onClick={handlePreviousClick}
              whileHover={{ scale: 1.15, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={28} />
            </motion.button>
          )}

          {currentIndex < totalSlides && (
            <motion.button
              className="nav-button next"
              onClick={handleNextClick}
              whileHover={{ scale: 1.15, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={28} />
            </motion.button>
          )}
        </div>

        {/* Pagination dots */}
        <div className="carousel-footer">
          <div className="slide-counter">
            {currentIndex + 1} de {totalSlides + 1}
          </div>

          <div className="slide-dots">
            {[...Array(totalSlides + 1)].map((_, idx) => (
              <motion.button
                key={idx}
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setSwipeDirection(idx > currentIndex ? 'right' : 'left')
                  setCurrentIndex(idx)
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>

        {/* Floating action button for add */}
        {currentIndex === totalSlides - 1 && (
          <motion.button
            className="fab-add"
            onClick={() => handleNextClick()}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={24} />
          </motion.button>
        )}
      </div>

      {/* Memory Actions Menu */}
      <MemoryActions
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  )
}
