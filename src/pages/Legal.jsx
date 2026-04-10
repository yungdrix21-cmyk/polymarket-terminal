import { useState, useEffect, useRef } from 'react'

const T = {
  bg0: '#0d0e14', bg1: '#12131c', bg2: '#181922', bg3: '#1e2030', bgCard: '#14151f',
  border: 'rgba(255,255,255,0.06)', borderHi: 'rgba(255,255,255,0.14)',
  blue: '#4f8eff', teal: '#00d4aa', red: '#ff4d6a', purple: '#9b7dff', yellow: '#f5c842',
  text0: '#e8eaf0', text1: '#8b8fa8', text2: '#4a4d62',
  font: '"DM Sans", system-ui, sans-serif',
}

const SECTIONS = [
  { id: 'terms',   label: 'Terms of service' },
  { id: 'privacy', label: 'Privacy policy' },
  { id: 'risk',    label: 'Risk disclosure' },
  { id: 'cookies', label: 'Cookie policy' },
]

function SectionBlock({ id, title, children }) {
  return (
    <div id={id} style={{ marginBottom: 56, scrollMarginTop: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text0, margin: '0 0 20px 0', paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function SubSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: T.teal, flexShrink: 0 }} />
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text0, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoBox({ color = T.teal, icon, children }) {
  return (
    <div style={{ background: color + '10', border: `1px solid ${color}30`, borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      {icon && <span style={{ color, fontSize: 14, flexShrink: 0, marginTop: 2 }}>{icon}</span>}
      <div style={{ fontSize: 13, color: T.text1, lineHeight: 1.6 }}>{children}</div>
    </div>
  )
}

function WarningBox({ children }) {
  return (
    <div style={{ background: T.red + '10', border: `1px solid ${T.red}40`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 15 }}>⚠️</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.red }}>Critical risk warning</span>
      </div>
      <div style={{ fontSize: 13, color: T.text1, lineHeight: 1.6 }}>{children}</div>
    </div>
  )
}

function BulletList({ color = T.teal, items }) {
  return (
    <ul style={{ listStyle: 'none', margin: '0 0 12px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: T.text1, lineHeight: 1.5 }}>
          <span style={{ color, flexShrink: 0, marginTop: 1 }}>•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '10px 14px', background: T.bg3, color: T.text0, fontWeight: 600, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? T.bgCard : T.bg2 }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '10px 14px', color: T.text1, borderBottom: `1px solid ${T.border}` }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function LegalPage({ onBack }) {
  const [active, setActive] = useState('terms')
  const contentRef = useRef(null)

  // Track which section is in view as user scrolls
  useEffect(() => {
    const container = contentRef.current
    if (!container) return
    const handler = () => {
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(s.id)
          return
        }
      }
      setActive('terms')
    }
    container.addEventListener('scroll', handler)
    return () => container.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el && contentRef.current) {
      contentRef.current.scrollTo({ top: el.offsetTop - 24, behavior: 'smooth' })
      setActive(id)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: T.bg0, fontFamily: T.font, color: T.text0 }}>

      {/* Top bar */}
      <div style={{ height: 52, borderBottom: `1px solid ${T.border}`, background: T.bg1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>P</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text0 }}>PolyTrader</span>
        </div>
        <span onClick={() => onBack && onBack()} style={{ fontSize: 13, color: T.text2, cursor: 'pointer' }}
          onMouseEnter={e => e.target.style.color = T.text1}
          onMouseLeave={e => e.target.style.color = T.text2}>
          ← Back
        </span>
      </div>

      {/* Body: sidebar + content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left sidebar */}
        <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${T.border}`, background: T.bg1, padding: '32px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.text2, margin: '0 0 12px 8px' }}>Legal Information</p>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 8, border: 'none',
              background: active === s.id ? T.teal + '15' : 'transparent',
              color: active === s.id ? T.teal : T.text2,
              fontSize: 13, fontWeight: active === s.id ? 600 : 400,
              cursor: 'pointer', fontFamily: T.font, textAlign: 'left',
              transition: 'all 0.15s', width: '100%',
            }}>
              {active === s.id && <div style={{ width: 3, height: 14, borderRadius: 2, background: T.teal, flexShrink: 0 }} />}
              {s.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '40px 48px 80px' }}>

          {/* ── TERMS OF SERVICE ── */}
          <SectionBlock id="terms" title="Terms of Service">
            <SubSection title="Acceptance of Terms">
              <p style={{ fontSize: 13, color: T.text1, lineHeight: 1.7, margin: '0 0 12px 0' }}>
                By using PolyTrader, you agree to these Terms of Service. If you don't agree — please don't use the platform.
              </p>
            </SubSection>

            <SubSection title="Service Description">
              <InfoBox color={T.teal} icon="ℹ">
                <strong style={{ color: T.text0 }}>PolyTrader is a non-custodial DeFi platform</strong> that provides:
                <BulletList color={T.teal} items={[
                  'Web interface for accessing prediction markets',
                  'AI market analysis for decision-making',
                  'Automated trading strategies',
                  'Trading monitoring tools',
                ]} />
              </InfoBox>
            </SubSection>

            <SubSection title="What We Don't Do">
              <BulletList color={T.red} items={[
                "We're NOT a custodial service — don't manage your funds",
                "We're NOT a guaranteed profit — trading involves risk",
                "We're NOT a financial advisor — provide only tool advice",
              ]} />
            </SubSection>

            <SubSection title="You Must">
              <BulletList color={T.teal} items={[
                'Be at least 18 years old',
                'Have full legal capacity',
                'Not be prohibited from using the platform in your jurisdiction',
              ]} />
            </SubSection>

            <SubSection title="Your Responsibility">
              <p style={{ fontSize: 13, color: T.text1, margin: '0 0 8px 0' }}>You are fully responsible for:</p>
              <BulletList color={T.blue} items={[
                'Security of your wallet and private keys',
                'Security of your account',
                'All transactions through your wallet',
                'Compliance with applicable laws',
              ]} />
            </SubSection>
          </SectionBlock>

          {/* ── PRIVACY POLICY ── */}
          <SectionBlock id="privacy" title="Privacy Policy">
            <SubSection title="Non-Custodial Nature">
              <BulletList color={T.teal} items={[
                "Your funds are protected — sit in your wallet",
                "We DON'T have access to funds — you control assets",
                "We DON'T store private keys — never request them",
              ]} />
            </SubSection>

            <SubSection title="What Data We Collect">
              <DataTable
                headers={['Data Type', 'Purpose']}
                rows={[
                  ['Wallet address', 'Platform connection'],
                  ['Transaction history', 'Performance tracking'],
                  ['Settings', 'Platform personalisation'],
                  ['IP address', 'Security'],
                ]}
              />
            </SubSection>

            <SubSection title="What We DON'T Store">
              <BulletList color={T.red} items={[
                'Private keys',
                'Seed phrases',
                'Your cryptocurrency funds',
              ]} />
            </SubSection>

            <SubSection title="How We Protect Data">
              <InfoBox color={T.blue} icon="🔒">
                <strong style={{ color: T.text0 }}>Security measures</strong>
                <BulletList color={T.blue} items={[
                  'Encryption of all sensitive data',
                  'HTTPS for all communications',
                  'Best access control',
                  'Regular security audits',
                ]} />
              </InfoBox>
            </SubSection>

            <SubSection title="Your Rights">
              <p style={{ fontSize: 13, color: T.text1, margin: '0 0 8px 0' }}>You have the right to:</p>
              <BulletList color={T.teal} items={[
                'Access your data',
                'Request a copy of data',
                'Correct inaccuracies',
                'Delete account at any time',
              ]} />
            </SubSection>
          </SectionBlock>

          {/* ── RISK DISCLOSURE ── */}
          <SectionBlock id="risk" title="Risk Disclosure">
            <WarningBox>
              Trading on prediction markets involves very high risks. You may lose all or a significant portion of your funds.<br /><br />
              <strong style={{ color: T.text0 }}>Only trade with funds you can afford to lose.</strong>
            </WarningBox>

            <SubSection title="Risk of Loss">
              <InfoBox color={T.red} icon="⚠">
                <strong style={{ color: T.text0 }}>Complete loss of capital</strong>
                <BulletList color={T.red} items={[
                  "If you buy YES and event doesn't happen → tokens = $0",
                  "If you buy NO and event happens → tokens = $0",
                  'No guarantee of fund recovery',
                ]} />
              </InfoBox>
            </SubSection>

            <SubSection title="Prediction Market Risks">
              <DataTable
                headers={['Risk', 'Description']}
                rows={[
                  ['Liquidity', 'Difficulty exiting positions quickly'],
                  ['Manipulation', 'Large players may influence prices'],
                  ['New Events', 'Edge cases may alter outcomes'],
                ]}
              />
            </SubSection>

            <SubSection title="Technical Risks">
              <InfoBox color={T.purple} icon="⛓">
                <strong style={{ color: T.text0 }}>Blockchain and platform</strong>
                <BulletList color={T.purple} items={[
                  'Smart contract failures',
                  'High gas fees at peak times',
                  'Network congestion delays',
                  'Loss of wallet access',
                  'Wallet errors',
                ]} />
              </InfoBox>
            </SubSection>

            <SubSection title="AI Analysis Risks">
              <InfoBox color={T.yellow} icon="🤖">
                <strong style={{ color: T.text0 }}>AI can be wrong</strong>
                <BulletList color={T.yellow} items={[
                  'Predictions are probabilistic, not certain',
                  'Historical data may be misleading',
                  'Qualitative data limitations',
                  'Edge cases may be ignored',
                ]} />
              </InfoBox>
            </SubSection>

            <SubSection title="Risk Management Recommendations">
              <InfoBox color={T.teal} icon="✓">
                <strong style={{ color: T.text0 }}>Tips</strong>
                <BulletList color={T.teal} items={[
                  'Start small — study the platform',
                  "Diversification — don't put all in one market",
                  'Monitoring — track your positions',
                  'Education — study prediction markets',
                ]} />
              </InfoBox>
            </SubSection>

            <SubSection title="When NOT to Use the Platform">
              <InfoBox color={T.red} icon="✕">
                <strong style={{ color: T.text0 }}>DON'T use PolyTrader if:</strong>
                <BulletList color={T.red} items={[
                  "Can't afford to lose invested funds",
                  'Looking for guaranteed profit',
                  "Don't have trading experience",
                  'Intend to borrow funds to trade',
                  'Using leveraged funds',
                  'Trading is prohibited in your jurisdiction',
                ]} />
              </InfoBox>
            </SubSection>
          </SectionBlock>

          {/* ── COOKIE POLICY ── */}
          <SectionBlock id="cookies" title="Cookie Policy">
            <SubSection title="What are Cookies">
              <p style={{ fontSize: 13, color: T.text1, lineHeight: 1.7, margin: '0 0 12px 0' }}>
                Cookies are small text files stored on your device for remembering actions and preferences.
              </p>
            </SubSection>

            <SubSection title="Types of Cookies">
              <DataTable
                headers={['Type', 'Description', 'Required']}
                rows={[
                  ['Essential', 'Session, authentication, security', 'Required'],
                  ['Functional', 'Settings, preferences, language', 'Optional'],
                  ['Analytics', 'Usage statistics', 'Optional'],
                ]}
              />
            </SubSection>

            <SubSection title="Managing Cookies">
              <InfoBox color={T.blue} icon="🌐">
                <strong style={{ color: T.text0 }}>Browser settings</strong>
                <BulletList color={T.blue} items={[
                  'You can manage cookies through browser settings',
                  'Chrome: Settings → Privacy → Cookies',
                  'Firefox: Settings → Privacy → Cookies',
                  'Safari: Settings → Privacy → Cookies',
                ]} />
              </InfoBox>
              <InfoBox color={T.yellow} icon="⚠">
                <strong style={{ color: T.text0 }}>Consequences of disabling</strong>
                <BulletList color={T.yellow} items={[
                  'Platform may not work correctly',
                  'Need to sign in again on each visit',
                  'Settings may not be saved',
                ]} />
              </InfoBox>
            </SubSection>
          </SectionBlock>

          {/* Footer note */}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 28 }}>
            <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.8, margin: '0 0 16px 0' }}>
              For all legal questions:<br />
              <span style={{ color: T.blue }}>Email: admin.polytrader@gmail.com</span>
            </p>
            <div style={{ background: T.teal + '0a', border: `1px solid ${T.teal}25`, borderRadius: 10, padding: '12px 16px' }}>
              <p style={{ fontSize: 12, color: T.text1, lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: T.text0 }}>Important reminder:</strong> PolyTrader is a non-custodial DeFi platform. Your funds always remain in your own wallet. Trading on prediction markets involves significant risk. Trading is prohibited in some jurisdictions.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}