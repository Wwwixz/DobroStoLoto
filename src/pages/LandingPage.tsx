import { Link } from 'react-router-dom'
import { UserPlus, Search, Heart, Award } from 'lucide-react'
import { Logo } from '../components/Logo'

const steps = [
  { icon: UserPlus, title: 'Зарегистрируйтесь на платформе' },
  { icon: Search, title: 'Найдите подходящее задание' },
  { icon: Heart, title: 'Откликнитесь и участвуйте' },
  { icon: Award, title: 'Получите подтверждение и волонтёрские часы' },
]

export const LandingPage = () => (
  <>
    <header className="public-header">
      <div className="container">
        <Logo />
        <nav className="main-nav">
          <a href="#how">О проекте</a>
          <a href="/tasks">Задания</a>
          <a href="#how">Фонды</a>
          <Link to="/login">Войти</Link>
        </nav>
        <Link to="/registration" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
          Регистрация
        </Link>
      </div>
    </header>

    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <h1>
              Делаем добро <br />
              <span className="accent">проСТО</span>
            </h1>
            <p className="hero-sub">
              Платформа для корпоративного волонтёрства сотрудников Столото
            </p>
            <div className="hero-actions">
              <Link to="/registration" className="btn btn-primary">Стать волонтёром</Link>
              <a href="#how" className="btn btn-outline">Узнать больше</a>
            </div>
          </div>
          <div className="hero-visual">
            <svg viewBox="0 0 320 320" className="hero-heart-svg" aria-hidden="true">
              <path
                d="M160 68C182-2 300 4 300 96c0 82-90 132-140 168C110 228 20 178 20 96 20 4 138-2 160 68Z"
                fill="none"
                stroke="#FFE9B8"
                strokeWidth="2"
                transform="rotate(-6 160 160) translate(14 -10)"
              />
              <path
                d="M160 84C179 24 282 30 282 110c0 74-82 119-122 151-40-32-122-77-122-151 0-80 103-86 122-26Z"
                fill="var(--primary)"
                fillRule="evenodd"
              />
              <path
                d="M160 132c9-22 46-20 46 10 0 27-30 43-46 55-16-12-46-28-46-55 0-30 37-32 46-10Z"
                fill="#FFFDF7"
              />
            </svg>
            <span className="hero-tagline">
              Вместе мы можем<br />больше <Heart size={16} fill="currentColor" strokeWidth={0} />
            </span>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat">
            <div className="stat-num">100<span className="plus">+</span></div>
            <div className="stat-label">благотворительных фондов</div>
          </div>
          <div className="stat">
            <div className="stat-num">500<span className="plus">+</span></div>
            <div className="stat-label">заданий</div>
          </div>
          <div className="stat">
            <div className="stat-num">10&nbsp;000<span className="plus">+</span></div>
            <div className="stat-label">сотрудников уже помогает</div>
          </div>
        </div>
      </div>
    </section>

    <section className="how-section" id="how">
      <div className="container">
        <h2 className="section-title">Как это работает?</h2>
        <div className="steps-grid">
          {steps.map(({ icon: Icon, title }) => (
            <div className="step" key={title}>
              <div className="step-icon">
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="landing-footer">
      <div className="container">
        <div className="footer-cta">
          <div>
            <h3>Уже есть аккаунт?</h3>
            <p>Войдите, чтобы откликнуться на задание</p>
          </div>
          <Link to="/login" className="btn btn-primary">Войти</Link>
        </div>
        <div className="footer-cta" style={{ marginTop: 18, background: '#fff', border: '1px solid var(--border)' }}>
          <div>
            <h3 style={{ fontSize: 20 }}>Вместе мы можем больше</h3>
          </div>
          <span className="heart"><Heart size={30} fill="currentColor" strokeWidth={0} /></span>
        </div>
      </div>
    </section>
  </>
)
