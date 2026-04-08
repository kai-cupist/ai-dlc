import styles from './HourglassAnimation.module.css';

interface HourglassAnimationProps {
  percent: number;
}

export function HourglassAnimation({ percent }: HourglassAnimationProps) {
  const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div className={styles.container} data-testid="hourglass-animation">
      <div className={styles.hourglass}>
        <div className={styles.top}>
          <div
            className={styles.sand}
            style={{ height: `${100 - clampedPercent}%` }}
          />
        </div>
        <div className={styles.middle} />
        <div className={styles.bottom}>
          <div
            className={styles.sand}
            style={{ height: `${clampedPercent}%` }}
          />
        </div>
      </div>
      <span className={styles.percent} data-testid="hourglass-percent">
        {clampedPercent}%
      </span>
    </div>
  );
}
