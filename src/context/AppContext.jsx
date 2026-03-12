import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [daysTogether, setDaysTogether] = useState(0)
  const [daysToAnniversary, setDaysToAnniversary] = useState(0)

  const DIARY_START_DATE = new Date(import.meta.env.VITE_DIARY_START_DATE || '2026-02-20')

  // Calcular dias juntos e próximo aniversário
  const calculateDays = useCallback(() => {
    const now = new Date()
    const diaryDate = new Date(DIARY_START_DATE)
    
    // Usar data local com timezone do Brasil
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startDate = new Date(diaryDate.getFullYear(), diaryDate.getMonth(), diaryDate.getDate())
    
    const diffTime = today - startDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // Contagem correta: se estamos no dia 21, e começou no dia 21, conta como 1 dia
    setDaysTogether(diffDays < 0 ? 0 : diffDays + 1)

    // Próximo aniversário
    const currentYear = today.getFullYear()
    let nextAnniversary = new Date(currentYear, DIARY_START_DATE.getMonth(), DIARY_START_DATE.getDate())
    if (nextAnniversary <= today) {
      nextAnniversary = new Date(currentYear + 1, DIARY_START_DATE.getMonth(), DIARY_START_DATE.getDate())
    }

    const daysUntil = Math.floor((nextAnniversary - today) / (1000 * 60 * 60 * 24))
    setDaysToAnniversary(daysUntil)
    
    // Verificar se é o dia do aniversário
    const isAnniversaryDay = today.getDate() === DIARY_START_DATE.getDate() && 
                             today.getMonth() === DIARY_START_DATE.getMonth()
    
    if (isAnniversaryDay) {
      // Mostrar notificação de aniversário
      showAnniversaryNotification()
    }
  }, [DIARY_START_DATE])

  // Função para mostrar notificação de aniversário
  const showAnniversaryNotification = useCallback(() => {
    const notificationShown = localStorage.getItem('anniversaryNotificationShown')
    const today = new Date().toDateString()
    
    if (notificationShown !== today) {
      localStorage.setItem('anniversaryNotificationShown', today)
      // Dispara evento para componentes mostrarem a notificação
      window.dispatchEvent(new CustomEvent('anniversary'))
    }
  }, [])

  // Inicializar usuário
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`
      localStorage.setItem('userId', newUserId)
      setUserId(newUserId)
    }

    calculateDays()
    const dayInterval = setInterval(calculateDays, 24 * 60 * 60 * 1000) // Atualizar a cada dia
    return () => clearInterval(dayInterval)
  }, [calculateDays])

  // Carregar memórias
  const loadMemories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('memories')
        .select('*')
        .eq('is_deleted', false)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      setMemories(data || [])
    } catch (err) {
      console.error('Erro ao carregar memórias:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar memórias na inicialização
  useEffect(() => {
    loadMemories()
  }, [loadMemories])

  // Configurar sincronização em tempo real
  useEffect(() => {
    const channel = supabase
      .channel('memories_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memories' },
        (payload) => {
          console.log('📡 Mudança detectada:', payload.eventType, payload)

          if (payload.eventType === 'INSERT') {
            setMemories((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            console.log('📡 Atualizando memória:', payload.new.id, payload.new)
            setMemories((prev) =>
              prev.map((m) => (m.id === payload.new.id ? payload.new : m))
            )
          } else if (payload.eventType === 'DELETE') {
            setMemories((prev) => prev.filter((m) => m.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão Realtime:', status)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  // Adicionar memória
  const addMemory = async (imageUrl, caption) => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .insert([
          {
            image_url: imageUrl,
            caption: caption,
            user_id: userId,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error('Erro ao adicionar memória:', error.message)
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          throw new Error('Erro de autenticação. Verifique as credenciais do Supabase.')
        }
        throw new Error(error.message || 'Erro ao adicionar memória')
      }

      return data[0]
    } catch (err) {
      console.error('Erro ao adicionar memória:', err)
      throw err
    }
  }

  // Atualizar memória
  const updateMemory = async (id, caption) => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .update({ caption })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Erro ao atualizar memória:', error.message)
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          throw new Error('Erro de autenticação. Verifique as credenciais do Supabase.')
        }
        throw new Error(error.message || 'Erro ao atualizar memória')
      }

      return data[0]
    } catch (err) {
      console.error('Erro ao atualizar memória:', err)
      throw err
    }
  }

  // Deletar memória (soft delete)
  const deleteMemory = async (id, imageUrl) => {
    try {
      // Soft delete - apenas marca como deletado
      const { error } = await supabase
        .from('memories')
        .update({ is_deleted: true })
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar memória:', error.message)
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          throw new Error('Erro de autenticação. Verifique as credenciais do Supabase.')
        }
        throw new Error(error.message || 'Erro ao deletar memória')
      }

      return true
    } catch (err) {
      console.error('Erro ao deletar memória:', err)
      throw err
    }
  }

  // Favoritação
  const toggleFavorite = async (id, currentStatus) => {
    console.log('toggleFavorite chamado:', { id, currentStatus, newValue: !currentStatus })
    try {
      const { data, error } = await supabase
        .from('memories')
        .update({ is_favorite: !currentStatus })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Erro ao favoritar:', error.message)
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          throw new Error('Erro de autenticação. Verifique as credenciais do Supabase.')
        }
        throw new Error(error.message || 'Erro ao favoritar')
      }

      console.log('Favorito atualizado com sucesso:', data)
      
      // Atualizar estado local imediatamente para melhor UX
      if (data && data[0]) {
        setMemories(prev => prev.map(m => m.id === id ? data[0] : m))
      }
      
      return data[0]
    } catch (err) {
      console.error('Erro ao favoritação:', err)
      throw err
    }
  }

  // Reordenar memórias
  const reorderMemories = async (memoriesToUpdate) => {
    try {
      // Fazer múltiplas atualizações
      for (const memory of memoriesToUpdate) {
        const { error } = await supabase
          .from('memories')
          .update({ display_order: memory.display_order })
          .eq('id', memory.id)

        if (error) throw error
      }

      await loadMemories()
      return true
    } catch (err) {
      console.error('Erro ao reordenar memórias:', err)
      throw err
    }
  }

  return (
    <AppContext.Provider
      value={{
        memories,
        loading,
        error,
        userId,
        daysTogether,
        daysToAnniversary,
        addMemory,
        updateMemory,
        deleteMemory,
        refreshMemories: loadMemories,
        diaryStartDate: DIARY_START_DATE,
        toggleFavorite
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider')
  }
  return context
}
