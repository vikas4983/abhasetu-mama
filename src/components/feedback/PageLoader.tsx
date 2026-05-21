export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading page">
      <div className="abha-loader" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="42" />
          <path d="M24 62h21l8-18 13 39 9-21h21" />
          <path d="M60 35v50M35 60h50" />
        </svg>
      </div>
      <span>Preparing secure care workspace</span>
    </div>
  );
}
