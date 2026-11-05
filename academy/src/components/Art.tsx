/**
 * Decorative artwork from the fuwari_imaging_assets pack (WebP, served from public/img).
 * Every image here is decorative: alt="" and aria-hidden, lazy unless marked eager.
 * Math, charts, buttons and explanations stay real DOM/SVG; nothing is placed inside answer boxes.
 */
const base = (import.meta.env && import.meta.env.BASE_URL) || '/'
export const art = (name: string) => `${base}img/${name}.webp`

export function Banner({ src, height = 180, position = 'center', eager = false, className = '' }: { src: string; height?: number; position?: string; eager?: boolean; className?: string }) {
  return (
    <div className={`banner ${className}`} style={{ height }} aria-hidden="true">
      <img src={art(src)} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: position }} />
    </div>
  )
}

export function Thumb({ src, position = 'center', className = '', eager = false }: { src: string; position?: string; className?: string; eager?: boolean }) {
  return <img className={`thumb ${className}`} src={art(src)} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: position }} aria-hidden="true" />
}
