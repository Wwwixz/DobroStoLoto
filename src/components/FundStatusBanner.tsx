import { Clock3, XCircle } from 'lucide-react'
import { useMyFoundation } from '../lib/foundationApi'

export const FundStatusBanner = () => {
  const { data, loading } = useMyFoundation()

  if (loading || !data) return null
  if (data.status === 'approved') return null

  if (data.status === 'pending') {
    return (
      <div className="fund-banner fund-banner-pending">
        <Clock3 size={22} />
        <div>
          <strong>Организация на проверке.</strong>{' '}
          Администратор изучает документы фонда — после одобрения станут доступны
          создание заданий и работа с откликами.
        </div>
      </div>
    )
  }

  return (
    <div className="fund-banner fund-banner-rejected">
      <XCircle size={22} />
      <div>
<strong>Заявка отклонена.</strong> Проверьте документы и контакт
        Проверьте документы и контакт администратора в сообщениях — возможно,
        понадобится повторная подача.
      </div>
    </div>
  )
}
