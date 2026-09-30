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
            <div className="hero-blob" />
            <div className="hero-blob-sm" />
            <div className="hero-heart">🤍</div>
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
          <span className="heart">🤍</span>
        </div>
      </div>
    </section>
  </>
)
