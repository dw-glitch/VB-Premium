import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { MemoryCard, AddMemoryCard } from './MemoryCard'
import { MemoryActions } from './MemoryActions'
import { ChevronLeft, ChevronRight, Plus, Grid, List, Heart, Clock, Play, Pause } from 'lucide-react'

export function PhotoGallery({ onEditClick, onEditMemory, onDeleteMemory }) {
  const { memories } = useApp()
  
  // View mode: 'carousel' | 'grid' | 'slideshow'
  const [viewMode, setViewMode] = useState('carousel')
  const [sortOrder, setSortOrder] = useState('newest') // 'newest' | 'oldest'
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [swipeDirection, setSwipeDirection] = useState(null)
  
  // Actions menu
  const [showActions, setShowActions] = useState(false)
  
  // Slideshow state
  const [isPlaying, setIsPlaying] = useState(false)
  const slideshowRef = useRef(null)
  
  // Filter and sort memories
  const filteredMemories = React.useMemo(() => {
    let result = [...memories]
    
    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter(m => m.is_favorite)
    }
    
    // Sort
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }
    
    return result
  }, [memories, showFavoritesOnly, sortOrder])
  
  const totalSlides = filteredMemories.length
  const hasPhotos = totalSlides > 0
  
  // Reset current index when filter changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [showFavoritesOnly, sortOrder])
  
  // Slideshow auto-play
  useEffect(() => {
    if (viewMode === 'slideshow' && isPlaying && totalSlides > 1) {
      slideshowRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % totalSlides)
      }, 3000) // 3 seconds per slide
    }
    
    return () => {
      if (slideshowRef.current) {
        clearInterval(slideshowRef.current)
      }
    }
  }, [viewMode, isPlaying, totalSlides])
  
  // Carousel handlers
  const handlePreviousClick = () => {
    if (currentIndex > 0) {
      setSwipeDirection('left')
      setCurrentIndex(prev => prev - 1)
    }
  }
  
  const handleNextClick = () => {
    if (currentIndex < totalSlides) {
      setSwipeDirection('right')
      setCurrentIndex(prev => prev + 1)
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
  
  // Edit/Delete handlers
  const handleEdit = () => {
    const currentMemory = filteredMemories[currentIndex]
    if (currentMemory) {
      onEditClick(currentMemory)
    }
  }
  
  const handleDelete = () => {
    const currentMemory = filteredMemories[currentIndex]
    if (currentMemory) {
      onEditClick({ ...currentMemory, delete: true })
    }
  }
  
  // Render Toolbar
  const renderToolbar = () => (
    <div className="gallery-toolbar">
      <div className="toolbar-left">
        <motion.button
          className={`toolbar-btn ${viewMode === 'carousel' ? 'active' : ''}`}
          onClick={() => setViewMode('carousel')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Carrossel"
        >
          <List size={20} />
        </motion.button>
        
        <motion.button
          className={`toolbar-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Galeria"
        >
          <Grid size={20} />
        </motion.button>
        
        <motion.button
          className={`toolbar-btn ${viewMode === 'slideshow' ? 'active' : ''}`}
          onClick={() => { setViewMode('slideshow'); setIsPlaying(true); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Slideshow"
        >
          <Play size={20} />
        </motion.button>
      </div>
      
      <div className="toolbar-right">
        <motion.button
          className={`toolbar-btn ${showFavoritesOnly ? 'active' : ''}`}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={showFavoritesOnly ? 'Mostrar todos' : 'Mostrar favoritos'}
        >
          <Heart size={20} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
        </motion.button>
        
        <motion.button
          className={`toolbar-btn ${sortOrder === 'newest' ? 'active' : ''}`}
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={sortOrder === 'newest' ? 'Mais antigos primeiro' : 'Mais recentes primeiro'}
        >
          <Clock size={20} />
        </motion.button>
      </div>
    </div>
  )
  
  // Empty state
  if (!hasPhotos) {
    return (
      <>
        {renderToolbar()}
        <div className="carousel-empty">
          <div className="empty-icon">📸</div>
          <p>{showFavoritesOnly ? 'Nenhum favorito ainda.' : 'Nenhuma foto ainda.'}</p>
          <p className="empty-hint">Adicione uma para começar nossa história!</p>
        </div>
      </>
    )
  }
  
  // Grid View
  if (viewMode === 'grid') {
    return (
      <>
        {renderToolbar()}
        <div className="gallery-grid">
          {filteredMemories.map((memory, index) => (
            <motion.div
              key={memory.id}
              className="grid-item"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <MemoryCard
                memory={memory}
                onPress={() => onEditClick(memory)}
                onOptionsClick={() => {}}
                onEditMemory={onEditMemory}
                onDeleteMemory={onDeleteMemory}
              />
            </motion.div>
          ))}
        </div>
      </>
    )
  }
  
  // Slideshow View
  if (viewMode === 'slideshow') {
    const currentPhoto = filteredMemories[currentIndex]
    
    return (
      <>
        {renderToolbar()}
        <div className="slideshow-container">
          <motion.div
            className="slideshow-image"
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src={currentPhoto.image_url} alt="Memória" />
          </motion.div>
          
          <div className="slideshow-controls">
            <motion.button
              className="slideshow-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </motion.button>
            
            <span className="slideshow-counter">
              {currentIndex + 1} / {totalSlides}
            </span>
          </div>
          
          <div className="slideshow-caption">
            {currentPhoto.caption || 'Sem legenda'}
          </div>
          
          {/* Navigation */}
          <button className="nav-button prev" onClick={handlePreviousClick}>
            <ChevronLeft size={28} />
          </button>
          <button className="nav-button next" onClick={handleNextClick}>
            <ChevronRight size={28} />
          </button>
        </div>
      </>
    )
  }
  
  // Carousel View (default)
  const currentPhoto = filteredMemories[currentIndex]
  const showAddCard = currentIndex === totalSlides
  
  return (
    <>
      {renderToolbar()}
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
                onPress={() => {}}
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
            onClick={handleNextClick}
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
