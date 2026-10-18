// Prints the SQL to seed an admin user, so the password never leaves your
// machine in plain text:
//   node scripts/hash-admin-password.mjs [username]
// It prompts for the username (if omitted) and password (hidden), then prints an INSERT to run in the
// Supabase SQL editor. Hash format must match lib/admin-password.ts.
import { randomBytes, scryptSync } from 'node:crypto'
import readline from 'node:readline'

const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) process.stdout.write(s)
      }
    }
    rl.question(question, (answer) => {
      rl.close()
      if (hidden) console.log()
      resolve(answer)
    })
  })
}

const username = (process.argv[2] ?? (await ask('Username (a-z 0-9 . _ -, 3-32 chars): '))).trim().toLowerCase()
if (!USERNAME_PATTERN.test(username)) {
  console.error('Username must be 3-32 chars of a-z 0-9 . _ -')
  process.exit(1)
}

const password = await ask('Password (min 10 chars): ', { hidden: true })
if (password.length < 10) {
  console.error('Password must be at least 10 characters.')
  process.exit(1)
}

const salt = randomBytes(16)
const hash = scryptSync(password, salt, 64)
const stored = `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
console.log(`insert into admin_users (username, password_hash) values ('${username}', '${stored}');`)
