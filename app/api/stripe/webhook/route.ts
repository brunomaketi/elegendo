import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as any,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const { user_id, plano } = session.metadata
    await supabase.from('profiles').update({ plano }).eq('id', user_id)
    await supabase.from('assinaturas').upsert({
      user_id,
      stripe_customer_id: session.customer,
      stripe_sub_id: session.subscription,
      plano,
      status: 'ativo',
      atualizado_em: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any
    const { data } = await supabase
      .from('assinaturas')
      .select('user_id')
      .eq('stripe_sub_id', sub.id)
      .single()
    if (data) {
      await supabase.from('profiles').update({ plano: 'gratuito' }).eq('id', data.user_id)
      await supabase.from('assinaturas').update({ status: 'cancelado' }).eq('stripe_sub_id', sub.id)
    }
  }

  return NextResponse.json({ received: true })
}
