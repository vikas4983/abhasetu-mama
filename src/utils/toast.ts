export function showToast(message: string, isError = false) {
  if (typeof window === 'undefined') return;
  const existing = document.querySelector('.setu-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `setu-toast ${isError ? 'setu-toast-error' : ''}`;
  
  if (isError) {
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; margin-right: 8px; color: #ef4444; display: inline-block; vertical-align: middle;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <span>${message}</span>
    `;
    toast.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    toast.style.backgroundColor = 'var(--bg-card)';
  } else {
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; margin-right: 8px; color: var(--accent-teal); display: inline-block; vertical-align: middle;">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
  }
  
  document.body.appendChild(toast);

  // Animate slide-out and remove
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
