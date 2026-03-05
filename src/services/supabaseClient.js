import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('⚠️ Variáveis de ambiente Supabase não configuradas!')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Função helper para fazer upload de imagem
export async function uploadImage(file, bucket = 'memories') {
  try {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg'
      })

    if (error) throw error

    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return publicUrl.publicUrl
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    throw error
  }
}

// Função helper para deletar imagem do storage
export async function deleteImage(imagePath, bucket = 'memories') {
  try {
    if (!imagePath || imagePath.startsWith('data:')) {
      return true // Não tentar deletar base64
    }

    const fileName = imagePath.split('/').pop()
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])

    if (error && error.message.includes('not found')) {
      return true // Arquivo já foi deletado, não é erro
    }

    return !error
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    return false
  }
}
