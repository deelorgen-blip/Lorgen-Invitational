#!/usr/bin/env node
/**
 * Lorgen Invitational — Setup Script
 * Kjør: node scripts/setup.js
 *
 * Gjør:
 *  1. Oppretter storage bucket "tournament-photos" i Supabase
 *  2. Sjekker at Supabase-tilkoblingen fungerer
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fybgegusbmdhoafkmutc.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SERVICE_ROLE_KEY) {
  console.error('❌  Mangler SUPABASE_SERVICE_ROLE_KEY i .env.local')
  process.exit(1)
}

async function createBucket() {
  console.log('📦  Oppretter storage bucket "tournament-photos"...')
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 'tournament-photos',
      name: 'tournament-photos',
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    }),
  })

  const data = await res.json()

  if (res.ok) {
    console.log('✅  Bucket opprettet!')
  } else if (data?.error === 'The resource already exists') {
    console.log('ℹ️   Bucket finnes allerede — OK')
  } else {
    console.error('❌  Feil:', data)
  }
}

async function checkConnection() {
  console.log('\n🔌  Sjekker Supabase-tilkobling...')
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tournaments?limit=1`, {
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
  })

  if (res.ok) {
    console.log('✅  Tilkobling OK!')
    console.log('   (Hvis du ser "relation \\"tournaments\\" does not exist", kjør supabase/schema.sql)')
  } else {
    const txt = await res.text()
    if (txt.includes('does not exist')) {
      console.log('⚠️   Tabeller mangler — kjør supabase/schema.sql i Supabase SQL Editor')
    } else {
      console.error('❌  Tilkobling feilet:', txt)
    }
  }
}

;(async () => {
  console.log('🏌️  Lorgen Invitational — Supabase Setup\n')
  await createBucket()
  await checkConnection()
  console.log('\n🎉  Setup ferdig!')
  console.log('\nNeste steg:')
  console.log('  1. Gå til https://supabase.com/dashboard/project/fybgegusbmdhoafkmutc/sql')
  console.log('  2. Paste innholdet fra supabase/schema.sql og klikk Run')
  console.log('  3. Deploy til Vercel og sett miljøvariabler (se DEPLOY.md)')
})()
