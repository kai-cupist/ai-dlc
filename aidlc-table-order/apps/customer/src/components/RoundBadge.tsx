import styles from './RoundBadge.module.css';

interface RoundBadgeProps {
  round: number;
}

export function RoundBadge({ round }: RoundBadgeProps) {
  const label = round === 1 ? '1회차' : `${round}회차 추가 주문`;
  return (
    <span className={styles.badge} data-testid={`round-badge-${round}`}>
      {label}
    </span>
  );
}
