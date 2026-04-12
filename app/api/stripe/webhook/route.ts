import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as any,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLANOS_VALIDOS = ['essencial', 'pro', 'agencia']

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET nao configurado')
    return NextResponse.json({ error: 'Configuracao invalida' }, { status: 500 })
  }

  let body: string
  try {
    body = await request.text()
  } catch {
    return NextResponse.json({ error: 'Erro ao ler body' }, { status: 400 })
  }

  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    console.warn('[webhook] Requisicao sem stripe-signature rejeitada')
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.warn('[webhook] Assinatura invalida:', err)
    return NextResponse.json({ error: 'Assinatura invalida' }, { status: 400 })
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const user_id = session.metadata?.user_id
        const plano = session.metadata?.plano

        if (!user_id || !plano) {
          console.error('[webhook] checkout.session.completed sem metadados validos', session.id)
          break
        }

        if (!PLANOS_VALIDOS.includes(plano)) {
          console.error('[webhook] Plano invalido nos metadados:', plano)
          break
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user_id)
          .single()

        if (profileError || !profile) {
          console.error('[webhook] user_id nao encontrado:', user_id)
          break
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ plano })
          .eq('id', user_id)

        if (updateError) {
          console.error('[webhook] Erro ao atualizar plano:', updateError)
          break
        }

        await supabase.from('assinaturas').upsert({
          user_id,
          stripe_customer_id: session.customer,
          stripe_sub_id: session.subscription,
          plano,
          status: 'ativo',
          atualizado_em: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        console.log(`[webhook] Plano atualizado: user=${user_id} plano=${plano}`)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        if (sub.status !== 'active') break

        const { data: assinatura } = await supabase
          .from('assinaturas')
          .select('user_id')
          .eq('stripe_sub_id', sub.id)
          .single()

        if (!assinatura) break

        await supabase
          .from('assinaturas')
          .update({ status: 'ativo', atualizado_em: new Date().toISOString() })
          .eq('stripe_sub_id', sub.id)

        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        const { data: assinatura } = await supabase
          .from('assinaturas')
          .select('user_id')
          .eq('stripe_sub_id', sub.id)
          .single()

        if (!assinatura) break

        await supabase
          .from('profiles')
          .update({ plano: 'gratuito' })
          .eq('id', assinatura.user_id)

        await supabase
          .from('assinaturas')
          .update({ status: 'cancelado', atualizado_em: new Date().toISOString() })
          .eq('stripe_sub_id', sub.id)

        console.log(`[webhook] Assinatura cancelada: user=${assinatura.user_id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as any).subscription as string | null
        if (!subId) break

        await supabase
          .from('assinaturas')
          .update({ status: 'inadimplente', atualizado_em: new Date().toISOString() })
          .eq('stripe_sub_id', subId)

        console.warn(`[webhook] Pagamento falhou: subscription=${subId}`)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('[webhook] Erro interno ao processar evento:', err)
    return NextResponse.json({ received: true, warning: 'Erro interno' })
  }

  return NextResponse.json({ received: true })
}
