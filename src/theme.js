const expand = (hex) => {
  const h = hex.replace('#', '');
  return h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
};
const rgb = (hex) => { const h = expand(hex); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const lum = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function contrastRatio(a, b) {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export const inkOn = (hex) => (contrastRatio(hex, '#FFFFFF') >= contrastRatio(hex, '#111111') ? '#FFFFFF' : '#111111');
export function mix(a, b, t) {
  const A = rgb(a), B = rgb(b);
  return '#' + A.map((v, i) => Math.round(v * (1 - t) + B[i] * t).toString(16).padStart(2, '0')).join('');
}

export function themeVars(c) {
  const ink = inkOn(c.accent);
  const line = mix(c.bg, c.text, 0.14);
  const soft = mix(c.bg, c.text, 0.05);
  const font = c.font ? `"${c.font.replace(/"/g, '')}",inherit` : 'inherit';
  const vars = {
    '--cc-font-family': font,
    '--cc-modal-border-radius': `${c.radius}px`,
    '--cc-btn-border-radius': `${Math.round(c.radius * 0.7)}px`,
    '--cc-bg': c.bg,
    '--cc-primary-color': c.text,
    '--cc-secondary-color': mix(c.text, c.bg, 0.22),
    '--cc-link-color': c.accent,
    '--cc-btn-primary-bg': c.accent,
    '--cc-btn-primary-color': ink,
    '--cc-btn-primary-border-color': c.accent,
    '--cc-btn-primary-hover-bg': mix(c.accent, '#000000', 0.12),
    '--cc-btn-primary-hover-color': ink,
    '--cc-btn-primary-hover-border-color': mix(c.accent, '#000000', 0.12),
    '--cc-btn-secondary-bg': 'transparent',
    '--cc-btn-secondary-color': c.accent,
    '--cc-btn-secondary-border-color': c.accent,
    '--cc-btn-secondary-hover-bg': soft,
    '--cc-btn-secondary-hover-color': c.accent,
    '--cc-btn-secondary-hover-border-color': c.accent,
    '--cc-separator-border-color': line,
    '--cc-toggle-on-bg': c.accent,
    '--cc-toggle-off-bg': mix(c.bg, c.text, 0.35),
    '--cc-toggle-on-knob-bg': '#FFFFFF',
    '--cc-toggle-off-knob-bg': '#FFFFFF',
    '--cc-cookie-category-block-bg': soft,
    '--cc-cookie-category-block-border': line,
    '--cc-footer-bg': soft,
    '--cc-footer-color': mix(c.text, c.bg, 0.22),
    '--cc-footer-border-color': line,
  };
  return `#cc-main{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';')}}`;
}
