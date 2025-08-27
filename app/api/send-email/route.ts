import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('📧 Recebida requisição para enviar email')
  
  try {
    const { to, candidateName, fitScore, classification } = await request.json()
    console.log('Dados recebidos:', { to, candidateName, fitScore, classification })

    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY não configurada - usando modo simulação')
      console.log('Email simulado enviado para:', to)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email simulado - RESEND_API_KEY não configurada',
        debug: { to, candidateName, fitScore, classification }
      })
    }

    const fromEmail = 'no-reply@fitscore.online'

    console.log('🚀 Tentando enviar email via Resend...')
    console.log('De:', fromEmail)
    console.log('Para:', to)
    
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject: 'Seu Resultado FitScore - PSL LEGAL',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .score { font-size: 2em; font-weight: bold; color: #2563eb; text-align: center; margin: 20px 0; }
              .classification { font-size: 1.2em; text-align: center; margin-bottom: 20px; padding: 10px; border-radius: 6px; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.9em; text-align: center; }
              
              /* Cores baseadas na classificação */
              .fit-altissimo { background: #d1fae5; color: #065f46; }
              .fit-aprovado { background: #dbeafe; color: #1e40af; }
              .fit-questionavel { background: #fef3c7; color: #92400e; }
              .fora-perfil { background: #fee2e2; color: #b91c1c; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏆 Resultado FitScore - PSL LEGAL</h1>
              </div>
              <div class="content">
                <h2>Olá ${candidateName}!</h2>
                <p>Seu resultado de avaliação FitScore está pronto:</p>
                
                <div class="score">${fitScore}/100</div>
                
                <div class="classification ${
                  classification === 'Fit Altíssimo' ? 'fit-altissimo' :
                  classification === 'Fit Aprovado' ? 'fit-aprovado' :
                  classification === 'Fit Questionável' ? 'fit-questionavel' : 'fora-perfil'
                }">
                  <strong>Classificação:</strong> ${classification}
                </div>
                
                ${fitScore >= 80 ? `
                <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <h3 style="color: #065f46; margin: 0;">🎉 Parabéns!</h3>
                  <p style="color: #065f46; margin: 10px 0 0 0;">Excelente desempenho na avaliação!</p>
                </div>
                ` : ''}
                
                <p>Agradecemos sua participação no processo de avaliação da PSL LEGAL.</p>
                
                <p><strong>Data da avaliação:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
              </div>
              <div class="footer">
                <p>Este é um email automático do sistema FitScore - PSL LEGAL</p>
                <p>Por favor, não responda este email</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    })

    const responseData = await resendResponse.json()
    console.log('Resposta do Resend:', responseData)

    if (!resendResponse.ok) {
      console.error('❌ Erro do Resend:', responseData)
      
      if (responseData.statusCode === 403) {
        console.log('🔄 Usando fallback devido a erro de verificação de domínio')
        console.log('Email simulado enviado para:', to)
        
        return NextResponse.json({ 
          success: true, 
          message: 'Email simulado - Domínio não verificado no Resend',
          debug: { to, candidateName, fitScore, classification }
        })
      }
      
      throw new Error(responseData.message || 'Falha ao enviar email via Resend')
    }

    console.log('✅ Email enviado com sucesso via Resend')
    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado com sucesso',
      resendId: responseData.id
    })

  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error)
    
    console.log('🔄 Usando fallback devido a erro')
    const { to, candidateName, fitScore, classification } = await request.json().catch(() => ({}))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email simulado devido a erro no envio',
      debug: { to, candidateName, fitScore, classification }
    })
  }
}