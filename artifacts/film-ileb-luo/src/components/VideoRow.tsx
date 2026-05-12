import { useRef, useState } from 'react';
import VideoCard from './VideoCard';
import type { FeedCard } from '../data/content';

interface Props {
  title: string;
  cards: FeedCard[];
  keyword?: string;
}

export default function VideoRow({ title, cards, keyword }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 640 : -640, behavior: 'smooth' });
  };

  return (
    <div className="module_container module_container_light_on">
      <div className="module_content">
        <div className="feed_container_2OIca">
          <div className="hscroll_wrapper_3CJzY">
            <h3 className="hscroll_title_30U6K">
              <div className="main_title_wrap_box_glhYQ">
                <p className="main_title_wrap_2TE0C">
                  <span className="main_title__lmLp main_title_hover_2QYJo">{title}</span>
                </p>
              </div>
              {keyword && (
                <div className="keywords_wrap_2IdTv">
                  <a className="keywords_1G-iy" href="#">{keyword}</a>
                </div>
              )}
            </h3>

            <div style={{ position: 'relative' }}>
              <div
                ref={scrollRef}
                className="hscroll_content_fdYOj"
                onScroll={updateScrollState}
                style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
              >
                <div className="card_container_1U0e6" style={{ paddingBottom: 4, flexDirection: 'row' }}>
                  {cards.map((card) => (
                    <div key={card.id} className="g-col" style={{ width: 148, minWidth: 148, flexShrink: 0 }}>
                      <VideoCard card={card} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll arrows */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll('left')}
                  style={{
                    position: 'absolute', left: -14, top: '38%', transform: 'translateY(-50%)',
                    width: 28, height: 60, background: '#1e1e1e', border: '1px solid #2a2a2a',
                    borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 5, color: '#aaa', fontSize: 18,
                  }}
                >‹</button>
              )}
              {canScrollRight && (
                <button
                  onClick={() => scroll('right')}
                  style={{
                    position: 'absolute', right: -14, top: '38%', transform: 'translateY(-50%)',
                    width: 28, height: 60, background: '#1e1e1e', border: '1px solid #2a2a2a',
                    borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 5, color: '#aaa', fontSize: 18,
                  }}
                >›</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
