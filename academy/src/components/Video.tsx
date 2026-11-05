/**
 * Video placeholder boxes. No iframe and no third-party script: a thumbnail from YouTube's image CDN
 * plus a link that opens the video in a new tab. Entries with an id were verified through YouTube's
 * oEmbed endpoint (title and channel copied from the response); `search` entries are honest
 * "search for this" boxes for topics where no specific video was verified.
 */
export type VideoRef = { id: string; title: string; channel: string; note?: string } | { search: string; note?: string }

export function VideoBox({ v }: { v: VideoRef }) {
  if ('search' in v) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(v.search)}`
    return (
      <a className="video video-search" href={url} target="_blank" rel="noreferrer">
        <span className="video-thumb video-thumb-empty">▶</span>
        <span className="video-text"><strong>Search YouTube: “{v.search}”</strong><small>{v.note ?? 'No specific video verified for this topic; pick a well-rated explainer.'}</small></span>
      </a>
    )
  }
  return (
    <a className="video" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer">
      <span className="video-thumb"><img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" decoding="async" /><span className="video-play">▶</span></span>
      <span className="video-text"><strong>{v.title}</strong><small>{v.channel}{v.note ? ` · ${v.note}` : ''}</small></span>
    </a>
  )
}

export function Videos({ list }: { list?: VideoRef[] }) {
  if (!list || !list.length) return null
  return (
    <div className="videos">
      <div className="small muted">Watch, if you want another angle (opens YouTube):</div>
      <div className="video-grid">{list.map((v, i) => <VideoBox key={i} v={v} />)}</div>
    </div>
  )
}
