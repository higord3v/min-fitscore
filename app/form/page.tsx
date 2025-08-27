'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

interface Answer {
  questionId: string
  category: 'performance' | 'energy' | 'culture'
  value: number
}

export default function FormPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: userData } } = await supabase.auth.getUser()
        setUser(userData)
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
      } finally {
        setUserLoading(false)
      }
    }

    getUser()
  }, [supabase.auth])

  const questions = [
    {
      id: 'p1',
      category: 'performance' as const,
      text: 'Experiência na área: Como avalia a experiência do candidato?',
      options: ['Nenhuma', 'Pouca', 'Média', 'Boa', 'Excelente']
    },
    {
      id: 'p2',
      category: 'performance' as const,
      text: 'Capacidade de entrega: O candidato cumpre prazos e metas?',
      options: ['Não cumpre', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre']
    },
    {
      id: 'p3',
      category: 'performance' as const,
      text: 'Habilidades técnicas: Domínio das competências requeridas?',
      options: ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Especialista']
    },
    {
      id: 'p4',
      category: 'performance' as const,
      text: 'Qualidade do trabalho: Atenção a detalhes e excelência?',
      options: ['Pobre', 'Regular', 'Boa', 'Muito boa', 'Excelente']
    },
    {
      id: 'e1',
      category: 'energy' as const,
      text: 'Disponibilidade: Flexibilidade e horários?',
      options: ['Nenhuma', 'Pouca', 'Média', 'Boa', 'Total']
    },
    {
      id: 'e2',
      category: 'energy' as const,
      text: 'Trabalho sob pressão: Performance em situações desafiadoras?',
      options: ['Não performa', 'Dificuldade', 'Neutro', 'Bom', 'Excelente']
    },
    {
      id: 'e3',
      category: 'energy' as const,
      text: 'Adaptação a prazos: Capacidade de se ajustar a cronogramas?',
      options: ['Inflexível', 'Pouco flexível', 'Neutro', 'Flexível', 'Muito flexível']
    },
    {
      id: 'c1',
      category: 'culture' as const,
      text: 'Alinhamento com valores: Comprometimento com princípios da empresa?',
      options: ['Nenhum', 'Pouco', 'Neutro', 'Bom', 'Total']
    },
    {
      id: 'c2',
      category: 'culture' as const,
      text: 'Trabalho em equipe: Colaboração e comunicação?',
      options: ['Individualista', 'Pouco colaborativo', 'Neutro', 'Colaborativo', 'Muito colaborativo']
    },
    {
      id: 'c3',
      category: 'culture' as const,
      text: 'Adaptação cultural: Fit com ambiente e valores organizacionais?',
      options: ['Não adaptável', 'Pouco adaptável', 'Neutro', 'Adaptável', 'Muito adaptável']
    }
  ]

  const handleAnswer = (questionId: string, category: 'performance' | 'energy' | 'culture', value: number) => {
    const newAnswers = answers.filter(a => a.questionId !== questionId)
    setAnswers([...newAnswers, { questionId, category, value }])
  }

  const calculateFitScore = (): { score: number; classification: string } => {
    const categoryWeights = {
      performance: 0.4,
      energy: 0.3,
      culture: 0.3
    }

    const categoryScores = {
      performance: 0,
      energy: 0,
      culture: 0
    }

    let categoryCounts = {
      performance: 0,
      energy: 0,
      culture: 0
    }

    answers.forEach(answer => {
      categoryScores[answer.category] += answer.value
      categoryCounts[answer.category] += 1
    })

    let totalScore = 0
    Object.keys(categoryScores).forEach(category => {
      const cat = category as keyof typeof categoryScores
      if (categoryCounts[cat] > 0) {
        const average = categoryScores[cat] / categoryCounts[cat]
        totalScore += average * categoryWeights[cat]
      }
    })

    const finalScore = Math.round(totalScore * 20)

    let classification = ''
    if (finalScore >= 80) classification = 'Fit Altíssimo'
    else if (finalScore >= 60) classification = 'Fit Aprovado'
    else if (finalScore >= 40) classification = 'Fit Questionável'
    else classification = 'Fora do Perfil'

    return { score: finalScore, classification }
  }

  const sendResultEmail = async (email: string, name: string, score: number, classification: string) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          candidateName: name,
          fitScore: score,
          classification
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Falha ao enviar email:', result.error)
        return false
      }

      console.log('Email enviado com sucesso:', result)
      return true

    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return false
    }
  }

  const handleSubmit = async (candidateData: { name: string; email: string }) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { score, classification } = calculateFitScore()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        throw new Error('Usuário não autenticado')
      }

      const { data: candidate, error: insertError } = await supabase
        .from('candidates')
        .insert({
          name: candidateData.name,
          email: candidateData.email,
          fit_score: score,
          classification,
          evaluated_by: currentUser.id
        })
        .select()
        .single()

      if (insertError) throw insertError

      const emailSent = await sendResultEmail(
        candidateData.email, 
        candidateData.name, 
        score, 
        classification
      )

      if (emailSent) {
        setSuccess('Avaliação concluída com sucesso! O candidato receberá um email com o resultado.')
      } else {
        setSuccess('Avaliação salva, mas houve um problema ao enviar o email. O resultado foi registrado no sistema.')
      }
      
      setTimeout(() => {
        router.refresh()
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'Erro ao salvar avaliação')
    } finally {
      setLoading(false)
    }
  }

  const renderQuestion = (question: typeof questions[0]) => {
    const currentAnswer = answers.find(a => a.questionId === question.id)?.value || 0

    return (
      <div key={question.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">{question.text}</h3>
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <label key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <input
                type="radio"
                name={question.id}
                value={index + 1}
                checked={currentAnswer === index + 1}
                onChange={() => handleAnswer(question.id, question.category, index + 1)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="flex-1">
                {index + 1} - {option}
              </span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  const renderCandidateForm = () => (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Dados do Candidato</h2>
      <form onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const candidateData = {
          name: formData.get('name') as string,
          email: formData.get('email') as string
        }
        handleSubmit(candidateData)
      }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Candidato</label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email do Candidato</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Finalizar Avaliação'}
          </button>
        </div>
      </form>
    </div>
  )

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (!user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-center mb-4">Email não confirmado</h1>
          <p className="text-center text-gray-600 mb-6">
            Por favor, verifique seu email e clique no link de confirmação para acessar o formulário.
          </p>
          <div className="text-center">
            <button
              onClick={async () => {
                const { error } = await supabase.auth.resend({
                  type: 'signup',
                  email: user.email!,
                })
                if (!error) alert('Email de confirmação reenviado!')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reenviar email de confirmação
            </button>
          </div>
          <div className="text-center mt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Formulário de Avaliação FitScore</h1>
            <p className="text-sm text-gray-600">Bem-vindo, {user.email}!</p>
            <p className="text-sm text-gray-500">
              Progresso: {answers.length}/10 perguntas respondidas
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
            {success.includes('problema') && (
              <p className="text-sm mt-2">
                Entre em contato com o administrador do sistema.
              </p>
            )}
          </div>
        )}

        {currentStep <= 10 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {questions[currentStep - 1].category === 'performance' && '🏆 Performance'}
                {questions[currentStep - 1].category === 'energy' && '⚡ Energia'}
                {questions[currentStep - 1].category === 'culture' && '🤝 Cultura'}
              </h2>
              <p className="text-gray-600">Pergunta {currentStep} de 10</p>
            </div>

            {renderQuestion(questions[currentStep - 1])}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => {
                  if (currentStep === 10) {
                    setCurrentStep(11)
                  } else {
                    setCurrentStep(prev => prev + 1)
                  }
                }}
                disabled={!answers.find(a => a.questionId === questions[currentStep - 1].id)}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {currentStep === 10 ? 'Finalizar' : 'Próxima'}
              </button>
            </div>
          </div>
        ) : (
          renderCandidateForm()
        )}
      </main>
    </div>
  )
}