import { Link } from 'react-router-dom';

export function Logo({
  size = 'md',
  inverted = false,
  showName = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
  showName?: boolean;
}) {
  return (
    <Link
      to="/"
      className={`logo-lockup logo-${size} ${inverted ? 'logo-inverted' : ''}`}
      aria-label="Crezonices Homepage"
    >
      <div className="logo-symbol-wrap">
        <img
          src="/assets/brand/crezonices-logo.png"
          alt="Crezonices brand mark"
          className="logo-emblem-img"
        />
      </div>
      {showName && (
        <div className="logo-text-group">
          <span className="logo-title">Crezonices</span>
          <span className="logo-subline">Intelligent Systems</span>
        </div>
      )}
    </Link>
  );
}
