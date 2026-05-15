/**
 * Roda uma única vez para criar o Gist de armazenamento.
 *
 * Uso:
 *   node scripts/create-gist.mjs SEU_TOKEN_AQUI
 *
 * O token precisa do escopo: gist
 * Gere em: https://github.com/settings/tokens/new?scopes=gist&description=Claude+Pacer
 */

const token = process.argv[2]
if (!token) {
  console.error('Uso: node scripts/create-gist.mjs SEU_GITHUB_TOKEN')
  process.exit(1)
}

const seedState = {
  limits: [
    { id: 'all_models', label: 'Todos os modelos', readings: [] },
    { id: 'sonnet_only', label: 'Somente Sonnet', readings: [] },
  ],
  cycle: { resetDayOfWeek: 3, resetHour: 17, resetMinute: 59 },
}

const res = await fetch('https://api.github.com/gists', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    description: 'Claude Pacer — usage tracking data',
    public: false,
    files: {
      'claude-pacer-data.json': { content: JSON.stringify(seedState) },
    },
  }),
})

const data = await res.json()

if (!res.ok) {
  console.error('Erro:', data.message)
  process.exit(1)
}

console.log('\n✅ Gist criado com sucesso!\n')
console.log('Adicione estes dois secrets no repositório GitHub:')
console.log('Settings → Secrets and variables → Actions → New repository secret\n')
console.log(`  VITE_GITHUB_TOKEN  =  ${token}`)
console.log(`  VITE_GIST_ID       =  ${data.id}`)
console.log('\nDepois faça um push para disparar o deploy. Pronto.')
