import { Icon } from './Icon'

export function Toast({ message }: { message: string }) {
  return (
    <div className="toast" role="status">
      <Icon name="check" size={18} strokeWidth={2.4} />
      <span>{message}</span>
    </div>
  )
}
