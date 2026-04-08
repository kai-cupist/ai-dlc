import styles from './SetupGuidePage.module.css';

export function SetupGuidePage() {
  return (
    <div className={styles.container} data-testid="setup-guide">
      <div className={styles.icon}>&#9888;</div>
      <h1 className={styles.title}>설정이 필요합니다</h1>
      <p className={styles.message}>
        관리자에게 재설정이 필요합니다.
        <br />
        매장 직원에게 문의해 주세요.
      </p>
      <div className={styles.info}>
        <p>이 태블릿의 매장 정보 또는 인증이 만료되었습니다.</p>
        <p>관리자가 초기 설정을 다시 진행해야 합니다.</p>
      </div>
    </div>
  );
}
