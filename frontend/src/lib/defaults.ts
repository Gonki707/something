export const DEFAULT_PHOTO =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=70';

export const DEFAULT_PORTRAIT =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=600&q=80';

export function photoOrDefault(src: string | null | undefined, fallback: string = DEFAULT_PHOTO): string {
  return src && src.trim().length > 0 ? src : fallback;
}
