import { useState } from 'react'
import { Send, ChevronLeft } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { chats as initialChats, type Chat } from '../data'

export const MessagesPage = () => {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeId, setActiveId] = useState(initialChats[0].id)
  const [text, setText] = useState('')

  const active = chats.find((c) => c.id === activeId)

  const send = () => {
    const value = text.trim()
    if (!value) return
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, last: value, time: 'Сейчас', messages: [...c.messages, { from: 'me', text: value, time: 'Сейчас' }] }
          : c
      )
    )
    setText('')
  }

  return (
    <VolunteerLayout>
      <h1 className="page-title" style={{ marginBottom: 16 }}>Сообщения</h1>

      <div className="messages-layout">
        <div className="chats-panel">
          <h2>Диалоги</h2>
          <div className="chat-list">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${chat.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(chat.id)}
              >
                <div className="chat-avatar">🏛️</div>
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
          <div className="chat-header">
            <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => window.history.back()}>
              <ChevronLeft size={17} />
            </button>
            <div className="chat-avatar" style={{ width: 36, height: 36, fontSize: 16 }}>🏛️</div>
            <div>
              <h3>{active?.name}</h3>
            </div>
            <span className="status-dot" style={{ marginLeft: 'auto' }} />
          </div>

          <div className="chat-messages">
            {active?.messages.map((m, i) => (
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
        </div>
      </div>
    </VolunteerLayout>
  )
}
