import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { uploadImage } from '../services/supabaseClient'
import { useApp } from '../context/AppContext'
import { Upload, X } from 'lucide-react'

export function PhotoUpload({ onUploadComplete, onClose }) {
  const { addMemory } = useApp()
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!selectedFile || !caption.trim()) {
      alert('Por favor, selecione uma imagem e escreva uma legenda')
      return
    }

    try {
      setUploading(true)

      // Upload da imagem
      const imageUrl = await uploadImage(selectedFile)

      // Adicionar memória ao banco
      await addMemory(imageUrl, caption.trim())

      alert('✨ Foto adicionada à nossa história!')
      onUploadComplete()
      resetForm()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar a foto. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setCaption('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <motion.div
      className="photo-upload-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="upload-content"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        <div className="upload-header">
          <h2>Adicionar Foto 💕</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="upload-form">
          {!previewUrl ? (
            <div
              className={`upload-area ${dragActive ? 'dragactive' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={48} />
              <p className="upload-text">Clique ou arraste uma foto aqui</p>
              <p className="upload-subtext">JPG, PNG ou GIF (máx. 10MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div className="preview-section">
              <div className="preview-image-wrapper">
                <img src={previewUrl} alt="Preview" className="preview-image" />
                <button
                  type="button"
                  className="change-image-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Trocar imagem
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>

              <div className="caption-input-group">
                <label htmlFor="caption">Escreva uma legenda especial:</label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="O que você sente quando vê essa foto?"
                  maxLength={500}
                  rows={4}
                  className="caption-textarea"
                />
                <span className="char-count">{caption.length}/500</span>
              </div>
            </div>
          )}

          <div className="upload-buttons">
            {previewUrl && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  resetForm()
                  fileInputRef.current?.click()
                }}
              >
                Cancelar
              </button>
            )}
            {previewUrl && (
              <motion.button
                type="submit"
                className="btn btn-primary"
                disabled={uploading || !caption.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {uploading ? '⏳ Salvando...' : '💾 Salvar na Galeria'}
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
