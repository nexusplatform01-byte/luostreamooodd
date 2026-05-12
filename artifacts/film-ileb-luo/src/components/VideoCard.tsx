import { useLocation } from 'wouter';
import type { FeedCard } from '../data/content';

interface Props {
  card: FeedCard;
}

export default function VideoCard({ card }: Props) {
  const [, navigate] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/play/${card.playId || '1'}`);
  };

  return (
    <div className="yk_card_368vl">
      <a href={`/play/${card.playId || '1'}`} onClick={handleClick} style={{ position: 'relative', display: 'block', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
        <div className="pack_wrap_2xjIs pack_vertical_ilL2U" style={{ paddingBottom: '145%', position: 'relative' }}>
          <div className="pack_img_wrap_3sS_W" style={{ position: 'absolute', inset: 0 }}>
            <img
              className="pack_img_YJm41"
              src={card.image}
              alt={card.title}
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
            />
          </div>

          {/* Badge top-left */}
          {card.badgeClass && card.badgeText && (
            <div className={`pack_mark_1hLkl ${card.badgeClass} null`}>
              <span style={{ fontFamily: 'Arial, sans-serif' }}>{card.badgeText}</span>
            </div>
          )}

          {/* Status top-right */}
          {card.statusText && (
            <div className="newSummaryLeft_2WuF0 undefined">
              <div className="newSummaryLeftText_22TVB" style={{ fontFamily: 'Arial, sans-serif' }}>{card.statusText}</div>
              <div className="newSummaryLeftSubTitle_3gXo1" style={{ fontFamily: 'Arial, sans-serif' }}>{card.statusSub}</div>
            </div>
          )}

          {/* Episode bottom */}
          <div className="lb_texts_wrap_1o6QN">
            <span className="lb_texts_23IEZ" style={{ fontFamily: 'Arial, sans-serif' }}>{card.episodeText}</span>
          </div>
        </div>

        {/* Title */}
        <div className="pack_title_vhB7u" style={{ fontFamily: 'Arial, sans-serif' }}>{card.title}</div>
        {/* Subtitle */}
        <div className="pack_subtitle_1HHha" style={{ fontFamily: 'Arial, sans-serif' }}>{card.subtitle}</div>
      </a>
    </div>
  );
}
