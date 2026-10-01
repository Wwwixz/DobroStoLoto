import { useState } from 'react'
import { Star, PawPrint, Baby } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'

const info = [
  { k: 'Имя', v: 'Алексей Иванов' },
  { k: 'Email', v: 'alexey@mail.ru' },
  { k: 'Телефон', v: '+7 999 123-45-67' },
  { k: 'Город', v: 'Москва' },
  { k: 'Дата регистрации', v: '12.04.2025' },
]

const achievements = [
  { icon: Star, bg: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', title: 'Активный участник', desc: 'Выполнено 5 и более заданий' },
  { icon: PawPrint, bg: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)', title: 'Помощь животным', desc: 'Участие в задании по категории «Животные»' },
  { icon: Baby, bg: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)', title: 'Забота о детях', desc: 'Участие в задании по категории «Дети»' },
]

export const ProfilePage = () => {
  const [tab, setTab] = useState<'info' | 'achievements'>('info')

  return (
    <VolunteerLayout>
      <div className="profile-head">
        <span className="avatar">АИ</span>
        <div>
          <h1>Алексей Иванов</h1>
          <p>Волонтёр</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
          Основная информация
        </button>
        <button className={`tab ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}>
          Мои достижения
        </button>
      </div>

      {tab === 'info' ? (
        <div className="info-table">
          {info.map((row) => (
            <div className="info-row-item" key={row.k}>
              <span className="k">{row.k}</span>
              <span className="v">{row.v}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="achievements">
          {achievements.map((a) => (
            <div className="ach-item" key={a.title}>
              <span className="ach-icon" style={{ background: a.bg, color: '#fff' }}>
                <a.icon size={20} fill={a.icon === Star ? 'currentColor' : 'none'} strokeWidth={a.icon === Star ? 0 : 2} />
              </span>
              <div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </VolunteerLayout>
  )
}
