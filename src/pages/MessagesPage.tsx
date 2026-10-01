import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, ChevronLeft, Building2, MessageCircle } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import type { Chat } from '../data'
import { api } from '../lib/api'

export const MessagesPage = () => {
  const [chats, setChats] = useState<Chat[] | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeId, setActiveId] = useState<number | null>(() => {
    const chat = searchParams.get('chat')
    return chat ? Number(chat) : null
  })
  const [text, setText] = useState('')

  useEffect(() => {
    let alive = true
    api<Chat[]>('/chats')
      .then((list) => {
        if (alive) setChats(list)
      })
      .catch(() => {
        if (alive) setChats([])
      })
    return () => {
      alive = false
    }
  }, [])

  const list = chats ?? []
  // Выбранным считается только явно открытый чат: без выбора справа — заглушка «Выберите чат».
  const activeIdValue =
    activeId && list.some((c) => c.id === activeId) ? activeId : null
  const active = list.find((c) => c.id === activeIdValue)

  const openChat = (id: number) => {
    setActiveId(id)
    setSearchParams({ chat: String(id) }, { replace: true })
    // помечаем диалог прочитанным: на сервере и сразу в списке (убираем бейдж)
    setChats((prev) => (prev ?? []).map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
    api(`/chats/${id}/read`, { method: 'POST' }).catch(() => {
      // молча: непрочитанные не критичны
    })
  }

  const closeChat = () => {
    setActiveId(null)
    setSearchParams({}, { replace: true })
  }

  const send = async () => {
    const value = text.trim()
    if (!value || !activeIdValue) return
    try {
      const updated = await api<Chat>(`/chats/${activeIdValue}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: value }),
      })
      setChats((prev) => (prev ?? []).map((c) => (c.id === activeIdValue ? updated : c)))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Сообщение не отправлено')
    }
    setText('')
  }

  if (chats === null) {
    return (
      <VolunteerLayout>
        <h1 className="page-title" style={{ marginBottom: 16 }}>Сообщения</h1>
        <p style={{ color: 'var(--muted)' }}>Загрузка диалогов…</p>
      </VolunteerLayout>
    )
  }

  if (list.length === 0) {
    return (
      <VolunteerLayout>
        <h1 className="page-title" style={{ marginBottom: 16 }}>Сообщения</h1>
        <div className="empty-state">
          Диалогов пока нет. Они появятся, когда фонды начнут переписку по вашим откликам.
        </div>
      </VolunteerLayout>
    )
  }

  return (
    <VolunteerLayout>
      <h1 className="page-title" style={{ marginBottom: 16 }}>Сообщения</h1>

      {/* На телефоне (до 860px) показываем либо список диалогов, либо чат — по классу chat-open */}
      <div className={`messages-layout ${activeIdValue ? 'chat-open' : ''}`}>
        <div className="chats-panel">
          <h2>Диалоги</h2>
          <div className="chat-list">
            {list.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${chat.id === activeIdValue ? 'active' : ''}`}
                onClick={() => openChat(chat.id)}
              >
                <div className="chat-avatar"><Building2 size={19} /></div>
                <div className="chat-item-body">
                  <div className="name">{chat.name}</div>
                  <div className="last">{chat.last}</div>
                </div>
                <div className="chat-meta">
                  <span className="time">{chat.time}</span>
                  {!!chat.unread && chat.unread > 0 && (
                    <span className="chat-unread" aria-label={`Непрочитанных: ${chat.unread}`}>
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-window">
          {active ? (
            <>
              <div className="chat-header">
                <button
                  className="icon-btn"
                  style={{ width: 34, height: 34 }}
                  onClick={closeChat}
                  aria-label="Закрыть чат"
                >
                  <ChevronLeft size={17} />
                </button>
                <div className="chat-avatar" style={{ width: 36, height: 36 }}><Building2 size={17} /></div>
                <div>
                  <h3>{active.name}</h3>
                </div>
                <span className="status-dot" style={{ marginLeft: 'auto' }} />
              </div>

              <div className="chat-messages">
                {active.messages.map((m, i) => (
                  <div key={i} className={`msg ${m.from}`}>
                    {m.text}
                    <span className="msg-time">{m.time}</span>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  className="input"
                  placeholder="Написать сообщение..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') send()
                  }}
                />
                <button className="send-btn" onClick={send} aria-label="Отправить">
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="chat-placeholder">
              <MessageCircle size={36} />
              <p>Выберите чат</p>
              <span>Выберите диалог слева, чтобы читать и отправлять сообщения</span>
            </div>
          )}
        </div>
      </div>
    </VolunteerLayout>
  )
}
