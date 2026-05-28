export function showToast(message: string) {
  if (typeof window === 'undefined') return;
  const existing = document.querySelector('.setu-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'setu-toast';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; margin-right: 8px; color: var(--accent-teal); display: inline-block; vertical-align: middle;">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Animate slide-out and remove
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}
