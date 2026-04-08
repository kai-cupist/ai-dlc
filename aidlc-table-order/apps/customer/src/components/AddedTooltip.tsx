import styles from './AddedTooltip.module.css';

export function AddedTooltip() {
  return (
    <div className={styles.tooltip} data-testid="added-tooltip">
      장바구니에 추가되었습니다
    </div>
  );
}
