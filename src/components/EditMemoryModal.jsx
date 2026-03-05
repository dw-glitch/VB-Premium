import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { X } from 'lucide-react'

export function EditMemoryModal({ memory, onClose, onSave }) {
  const { updateMemory, deleteMemory } = useApp()
  const [caption, setCaption] = useState(memory.caption)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    if (!caption.trim()) {
      alert('A legenda não pode estar vazia')
      return
    }

    try {
      setSaving(true)
      await updateMemory(memory.id, caption.trim())
      onSave()
      alert('✨ Legenda atualizada!')
      onClose()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao atualizar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar esta foto? 😢')) {
      return
    }

    try {
      setDeleting(true)
      await deleteMemory(memory.id, memory.image_url)
      onSave()
      alert('Foto deletada')
      onClose()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao deletar. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      className="edit-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="edit-modal-content"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-header">
          <h2>Editar Memória 💕</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="edit-preview">
          <img src={memory.image_url} alt="Memória" className="preview-image" />
        </div>

        <div className="edit-caption-group">
          <label htmlFor="edit-caption">Editar legenda:</label>
          <textarea
            id="edit-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            rows={4}
            className="caption-textarea"
          />
          <span className="char-count">{caption.length}/500</span>
        </div>

        <div className="edit-buttons">
          <motion.button
            className="btn btn-outline"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancelar
          </motion.button>

          <motion.button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {deleting ? '⏳ Deletando...' : '🗑️ Deletar'}
          </motion.button>

          <motion.button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !caption.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? '⏳ Salvando...' : '💾 Salvar'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
