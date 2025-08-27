'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

interface Candidate {
  id: string
  name: string
  email: string
  fit_score: number
  classification: string
  created_at: string
  evaluated_by: string
}

interface UserProfile {
  role: string
}

export default function DashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const router = useRouter()
  const supabase = createClient()
  useEffect(() => {
    const getUserData = async () => {
      try {
        console.log('🔄 Buscando dados do usuário...')
        
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('❌ Erro ao buscar usuário:', userError)
          router.push('/login')
          return
        }

        console.log('✅ Usuário encontrado:', userData?.email)
        setUser(userData)

        if (!userData) {
          console.log('❌ Nenhum usuário autenticado')
          router.push('/login')
          return
        }

        console.log('🔄 Buscando perfil do usuário...')
        // Buscar perfil do usuário na tabela user_profiles
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', userData.id)
          .single()
        console.log(profile)
        if (profileError) {
          console.error('❌ Erro ao buscar perfil:', profileError)
          console.log('🔄 Tentando verificar se é admin por email...')
          
          // Fallback: verificar por email específico
          const isAdminByEmail = userData.email === 'admin@pslegal.com'
          if (isAdminByEmail) {
            console.log('✅ Admin detectado por email')
            setUserProfile({ role: 'admin' })
            await fetchCandidates()
            return
          }
          
          router.push('/form')
          return
        }

        console.log('✅ Perfil encontrado:', profile)
        setUserProfile(profile)
        // Verificar se é admin - usando a role da tabela user_profiles
        if (!profile || profile.role !== 'admin') {
          console.log('❌ Usuário não é admin, redirecionando para /form')
          router.push('/form')
          return
        }

        console.log('✅ Usuário é admin, buscando candidatos...')
        await fetchCandidates()
      } catch (err) {
        console.error('❌ Erro ao buscar dados do usuário:', err)
        setError('Erro ao carregar dados')
        router.push('/form')
      }
    }

    getUserData()
  }, [supabase.auth, router])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      console.log('🔄 Buscando candidatos...')
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar candidatos:', error)
        throw error
      }

      console.log(`✅ ${data?.length || 0} candidatos encontrados`)
      setCandidates(data || [])
      setFilteredCandidates(data || [])
    } catch (err: any) {
      console.error('❌ Erro ao buscar candidatos:', err)
      setError(err.message || 'Erro ao carregar candidatos')
      
      // Se for erro 401, redirecionar para login
      if (err.message?.includes('401') || err.code === 'PGRST301') {
        console.log('🔄 Token expirado, redirecionando para login...')
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }


  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    
    if (newFilter === 'all') {
      setFilteredCandidates(candidates)
    } else {
      setFilteredCandidates(
        candidates.filter(candidate => candidate.classification === newFilter)
      )
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Fit Altíssimo':
        return 'bg-green-100 text-green-800'
      case 'Fit Aprovado':
        return 'bg-blue-100 text-blue-800'
      case 'Fit Questionável':
        return 'bg-yellow-100 text-yellow-800'
      case 'Fora do Perfil':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-bold'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Loading enquanto verifica autenticação
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4">Carregando...</p>
      </div>
    )
  }

  // Se não for admin, não renderiza nada (já será redirecionado)
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin - FitScore</h1>
            <p className="text-sm text-gray-600">Bem-vindo, {user.email}!</p>
            <p className="text-xs text-gray-500">Role: {userProfile.role}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => handleFilterChange('Fit Altíssimo')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === 'Fit Altíssimo'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Fit Altíssimo
            </button>
            <button
              onClick={() => handleFilterChange('Fit Aprovado')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === 'Fit Aprovado'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Fit Aprovado
            </button>
            <button
              onClick={() => handleFilterChange('Fit Questionável')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === 'Fit Questionável'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Fit Questionável
            </button>
            <button
              onClick={() => handleFilterChange('Fora do Perfil')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === 'Fora do Perfil'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Fora do Perfil
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{candidates.length}</div>
            <div className="text-sm text-gray-600">Total de Candidatos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {candidates.filter(c => c.classification === 'Fit Altíssimo').length}
            </div>
            <div className="text-sm text-gray-600">Fit Altíssimo</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {candidates.filter(c => c.classification === 'Fit Aprovado').length}
            </div>
            <div className="text-sm text-gray-600">Fit Aprovado</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {candidates.filter(c => c.classification === 'Fora do Perfil').length}
            </div>
            <div className="text-sm text-gray-600">Fora do Perfil</div>
          </div>
        </div>

        {/* Lista de Candidatos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Candidatos Avaliados</h2>
            <button
              onClick={fetchCandidates}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button
                onClick={fetchCandidates}
                className="ml-4 text-red-800 underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'Nenhum candidato avaliado' : 'Nenhum candidato nesta categoria'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Quando os candidatos forem avaliados, eles aparecerão aqui.'
                  : `Nenhum candidato encontrado com classificação "${filter}".`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      FitScore
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classificação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{candidate.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getScoreColor(candidate.fit_score)}`}>
                          {candidate.fit_score}/100
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClassificationColor(candidate.classification)}`}>
                          {candidate.classification}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(candidate.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredCandidates.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Mostrando {filteredCandidates.length} de {candidates.length} candidatos
            </div>
          )}
        </div>
      </main>
    </div>
  )
}