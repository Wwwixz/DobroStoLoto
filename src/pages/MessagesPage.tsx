import { useEffect, useState } from 'react'
import { Send, ChevronLeft, Building2 } from 'lucide-react'
import type { Chat } from '../data'
import { api } from '../lib/api'

export const MessagesPage = () => {
  const [chats, setChats] = useState<Chat[] | null>(null)
  const [activeId, setActiveId] = useState<number | null>(null)
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
  const activeIdValue = activeId
  const active = activeIdValue !== null ? list.find((c) => c.id === activeIdValue) ?? null : null

  const send = async () => {
    const value = text.trim()
    if (!value || activeIdValue === null) return
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
      <>
        <h1 className="page-title" style={{ marginBottom: 16 }}>Сообщения</h1>
        <p style={{ color: 'var(--muted)' }}>Загрузка диалогов…</p>
      </>
    )
  }

  return (
    <>
      <h1 className="page-title" style={{ marginBottom: 16 }}>Сообщения</h1>

      <div className="messages-layout">
        <div className="chats-panel">
          <h2>Диалоги</h2>
          <div className="chat-list">
            {list.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${chat.id === activeIdValue ? 'active' : ''}`}
                onClick={() => setActiveId(chat.id)}
              >
                <div className="chat-avatar"><Building2 size={19} /></div>
                <div className="chat-item-body">
                  <div className="name">{chat.name}</div>
                  <div className="last">{chat.last}</div>
                </div>
                <span className="time">{chat.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-window">
          {active ? (
            <>
              <div className="chat-header">
                <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setActiveId(null)}>
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
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                borderRadius: 16,
                color: 'var(--muted)',
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 8px', color: 'var(--text)' }}>Выберите диалог</h3>
                <p style={{ margin: 0 }}>Чтобы начать общение — выберите собеседника из списка слева</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
