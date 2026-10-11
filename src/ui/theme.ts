/**
 * 主题：浅色 / 深色 / 跟随系统
 */

function getDoc(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

export function applyTheme(theme: 'light' | 'dark' | 'auto'): void {
  const d = getDoc();
  if (!d) return;
  const root = d.documentElement;
  if (theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  try {
    if (typeof localStorage !== 'undefined' && localStorage) localStorage.setItem('oels.theme', theme);
  } catch {
    /* 忽略存储失败 */
  }
}

export function loadTheme(): 'light' | 'dark' | 'auto' {
  try {
    if (typeof localStorage === 'undefined' || !localStorage) return 'auto';
    const v = localStorage.getItem('oels.theme');
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}
