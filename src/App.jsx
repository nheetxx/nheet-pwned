import { useState } from 'react'
import './App.css'

const RANGE_API_URL = 'https://api.pwnedpasswords.com/range/'

async function getSha1Hex(value) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure hashing is not supported in this browser. Open the app over localhost or HTTPS.')
  }

  const digest = await globalThis.crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(value),
  )

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  )
    .join('')
    .toUpperCase()
}

async function checkPassword(password) {
  const hash = await getSha1Hex(password)
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)
  const response = await fetch(`${RANGE_API_URL}${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many requests. Wait a moment, then try again.')
    }

    throw new Error(`The checker returned status ${response.status}. Please try again later.`)
  }

  const rows = (await response.text()).split(/\r?\n/)
  let occurrenceCount = 0
  let hasRows = false

  for (const row of rows) {
    if (!row) continue
    hasRows = true

    const match = /^([A-F0-9]{35}):(\d+)$/i.exec(row)
    if (!match) {
      throw new Error('The checker returned an invalid response.')
    }

    if (match[1].toUpperCase() === suffix) {
      occurrenceCount = Number(match[2])
      if (!Number.isSafeInteger(occurrenceCount)) {
        throw new Error('The occurrence count returned by the checker is invalid.')
      }
    }
  }

  if (!hasRows) {
    throw new Error('The checker returned an empty response.')
  }

  return occurrenceCount
}

function App() {
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsChecking(true)
    setResult(null)

    try {
      const occurrenceCount = await checkPassword(password)
      setResult({ type: occurrenceCount > 0 ? 'found' : 'safe', occurrenceCount })
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsChecking(false)
    }
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value)
    setResult(null)
  }

  return (
    <main className="page-shell">
      <section className="checker" aria-labelledby="page-title">
        <h1 id="page-title">nheet-pwned</h1>
        <p className="intro">
          Check whether a password has appeared in known data breaches. Your password
          is never sent to the checker.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="password">Password</label>
          <div className="input-row">
            <input
              autoComplete="off"
              disabled={isChecking}
              id="password"
              onChange={handlePasswordChange}
              placeholder="Enter a password"
              required
              type={isPasswordVisible ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              aria-pressed={isPasswordVisible}
              className="visibility-button"
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              disabled={isChecking}
              type="button"
            >
              {isPasswordVisible ? 'Hide' : 'Show'}
            </button>
          </div>
          <button className="submit-button" disabled={isChecking} type="submit">
            {isChecking ? (
              <>
                <span aria-hidden="true" className="spinner" />
                Checking...
              </>
            ) : (
              'Check password'
            )}
          </button>
        </form>

        <div aria-live="polite" className="result-region">
          {result?.type === 'found' && (
            <div className="result result-found" role="status">
              <span aria-hidden="true" className="result-icon">!</span>
              <div>
                <h2>This password has been found</h2>
                <p>
                  Found {result.occurrenceCount.toLocaleString('en-US')} times. Change it
                  and don&apos;t reuse it on other accounts.
                </p>
              </div>
            </div>
          )}
          {result?.type === 'safe' && (
            <div className="result result-safe" role="status">
              <span aria-hidden="true" className="result-icon">✓</span>
              <div>
                <h2>No match found</h2>
                <p>
                  This does not guarantee the password is safe; the database may not
                  include every breach.
                </p>
              </div>
            </div>
          )}
          {result?.type === 'error' && (
            <div className="result result-error" role="alert">
              <span aria-hidden="true" className="result-icon">!</span>
              <div>
                <h2>Check failed</h2>
                <p>{result.message}</p>
              </div>
            </div>
          )}
        </div>

        <p className="privacy-note">
          Your password is hashed in your browser. Only the first 5 hash characters
          are sent; the rest is matched locally.
        </p>
      </section>

      <footer className="page-footer">
        <p>
          Powered by{' '}
          <a href="https://haveibeenpwned.com/" rel="noreferrer" target="_blank">
            Have I Been Pwned
          </a>
          . Use a device you trust.
        </p>
        <p className="credit">
          <span>2026 nheetxx.</span>
          <span>dibuat dengan sepenuh hati {'<3'}</span>
        </p>
      </footer>
    </main>
  )
}

export default App
