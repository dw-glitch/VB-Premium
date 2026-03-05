import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp, AppProvider } from './context/AppContext'
import { SplashScreen } from './components/SplashScreen'
import { DaysCounter } from './components/DaysCounter'
import { PhotoGallery } from './components/PhotoGallery'
import { PhotoUpload } from './components/PhotoUpload'
import { EditMemoryModal } from './components/EditMemoryModal'
import { MemoryCard, AddMemoryCard } from './components/MemoryCard'
import { AnniversaryNotification } from './components/AnniversaryNotification'
import './styles/global.css'

function AppContent() {
  const { memories, loading, refreshMemories, deleteMemory } = useApp()
  const [showSplash, setShowSplash] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [editingMemory, setEditingMemory] = useState(null)

  const handleStartCarousel = () => {
    setShowSplash(false)
  }

  const handleEditClick = (memory) => {
    if (memory.addNew) {
      // Abrir modal de upload
      setShowUpload(true)
    } else if (memory.delete) {
      // Abrir modal de delete
      setEditingMemory(memory)
    } else {
      setEditingMemory(memory)
    }
  }

  const handleEditMemory = (memory) => {
    setEditingMemory(memory)
  }

  const handleDeleteMemory = async (memory) => {
    if (confirm('Tem certeza que deseja deletar esta foto?')) {
      try {
        await deleteMemory(memory.id, memory.image_url)
        refreshMemories()
        alert('Foto deletada')
      } catch (error) {
        console.error('Erro ao deletar:', error)
        const message = error?.message || 'Erro ao deletar. Verifique as permissões no banco de dados.'
        alert(message)
      }
    }
  }

  const handleUploadComplete = () => {
    setShowUpload(false)
    refreshMemories()
  }

  const handleEditSave = () => {
    setEditingMemory(null)
    refreshMemories()
  }

  if (showSplash) {
    return <SplashScreen onStart={handleStartCarousel} />
  }

  return (
    <div className="app">
      <AnniversaryNotification />
      <div className="main-container">
        <div className="content">
          <DaysCounter />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--rosa-premium)' }}>
              <p>Carregando memórias...</p>
            </div>
          ) : (
            <>
              <PhotoGallery 
                onEditClick={handleEditClick} 
                onEditMemory={handleEditMemory}
                onDeleteMemory={handleDeleteMemory}
              />

              {memories.length === 0 && (
                <div className="carousel-empty">
                  <div className="empty-icon">📸</div>
                  <p>Nenhuma foto ainda.</p>
                  <p className="empty-hint">Adicione uma para começar nossa história!</p>
                </div>
              )}

              {/* Always show add button */}
              <motion.div 
                style={{ textAlign: 'center', marginTop: '2rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => setShowUpload(true)}
                  style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}
                >
                  + Adicionar Memória
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showUpload && (
          <PhotoUpload
            onUploadComplete={handleUploadComplete}
            onClose={() => setShowUpload(false)}
          />
        )}

        {editingMemory && (
          <EditMemoryModal
            memory={editingMemory}
            onClose={() => setEditingMemory(null)}
            onSave={handleEditSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

