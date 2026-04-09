import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

const PRICES: Record<string, string> = {
  pro:     process.env.STRIPE_PRICE_PRO!,
  agencia: process.env.STRIPE_PRICE_AGENCIA!,
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { plano } = await request.json()
  const priceId = PRICES[plano]
  if (!priceId) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    metadata: { user_id: user.id, plano },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos?sucesso=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos?cancelado=true`,
  })

  return NextResponse.json({ url: session.url })
}
