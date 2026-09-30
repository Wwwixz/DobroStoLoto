import { Heart } from 'lucide-react'

export const Logo = ({ light = false }: { light?: boolean }) => (
  <a className="logo" href={light ? '/login' : '/'}>
    <span className="logo-heart">
      <Heart size={18} fill="currentColor" strokeWidth={0} />
    </span>
    <span className="logo-text">
      Помогать
      <span>проСТО</span>
    </span>
  </a>
)
