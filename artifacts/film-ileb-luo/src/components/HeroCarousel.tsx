import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { getCarousel, CarouselDoc, getAllContent, ContentDoc } from '../lib/db';
import { swiperSlides, bulletCards } from '../data/content';

function featuredToCarousel(c: ContentDoc): CarouselDoc {
  return {
    id: c.id,
    image: c.thumbnail || '',
    title: c.title,
    description: c.description || '',
    contentId: c.id!,
    isActive: true,
    order: 999,
    createdAt: c.createdAt,
  };
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [, navigate] = useLocation();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [carouselItems, setCarouselItems] = useState<CarouselDoc[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      getCarousel(),
      getAllContent(),
    ]).then(([carousel, content]) => {
      const featured = content.filter(c => c.isFeatured && c.thumbnail);
      const featuredAsCarousel = featured.map(featuredToCarousel);
      const carouselIds = new Set(carousel.map(c => c.contentId));
      const uniqueFeatured = featuredAsCarousel.filter(f => !carouselIds.has(f.contentId));
      setCarouselItems([...carousel, ...uniqueFeatured]);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const useFirebase = loaded && carouselItems.length > 0;
  const totalSlides = useFirebase ? carouselItems.length : swiperSlides.length;

  const goTo = useCallback((idx: number) => setCurrent(idx), []);
  const next = useCallback(() => setCurrent(prev => (prev + 1) % totalSlides), [totalSlides]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  }, [next]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  if (!loaded) return <div style={{ height: 390, background: '#111' }} />;

  if (useFirebase) {
    const safeIdx = current >= carouselItems.length ? 0 : current;
    const slide = carouselItems[safeIdx];
    if (!slide) return <div style={{ height: 390, background: '#111' }} />;
    return (
      <div className="swiper_wrap_3_CON"
        onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
        onMouseLeave={startTimer}>
        <div className="swiper_container_custom">
          <div className="swiper-wrapper">
            {carouselItems.map((item, i) => (
              <div key={item.id || i} className={`swiper-slide${i === current ? ' active' : ''}`}>
                <div className="swiper_item_img_wrap_2vvR2">
                  <div className="swiper_show_img_qwMgx">
                    <a href="#" onClick={e => { e.preventDefault(); if (item.contentId) navigate(`/play/${item.contentId}`); }}>
                      <img src={item.image} alt={item.title}
                        onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                    </a>
                    <div className="img_top_shadow_1Jl5Y" />
                    <div className="img_left_shadow_3uQE-" />
                    <div className="img_bottom_shadow_3gdlg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pagination_info_wrap_2djxx">
          <div className="swiper_item_info_wrap_xr4-T">
            <div className="swiper_item_info_CFKcC" style={{ display: 'block' }}>
              {slide.title && (
                <div className="swiper_item_title_1gdGI" style={{ fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', fontSize: 22, fontWeight: 900 }}>{slide.title}</div>
              )}
              <div className="item_wrap_3czPf">
                <div className="item_2wPCe">
                  {slide.description && (
                    <div className="swiper_item_desc_1pk_I" style={{ fontFamily: 'Arial, sans-serif' }}>{slide.description}</div>
                  )}
                </div>
                <div className="swiper_item_control_1C-Qx">
                  <div className="control_btn_wrap_3w0t8">
                    <a href="#" onClick={e => { e.preventDefault(); if (slide.contentId) navigate(`/play/${slide.contentId}`); }}>
                      <div className="swiper_item_play_btn_3oJP-">
                        <span className="play_icon_2lZmx">▶</span>
                        <span className="play_btn_text_1x4lT" style={{ fontFamily: 'Arial, sans-serif' }}>PLAY</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="custom_pagination_wrap_zvWry hero-pagination-desktop">
            <div className="hscroll_wrapper_3CJzY">
              <div className="hscroll_content_fdYOj">
                <div className="card_container_1U0e6">
                  {carouselItems.slice(0, 7).map((item, i) => {
                    const isActive = i === current;
                    return (
                      <div key={item.id || i} className="bullet_wrap_1yE2X g-col-swiper" onClick={() => goTo(i)}>
                        <div className="yk_card_368vl">
                          <a href="#" onClick={e => { e.preventDefault(); goTo(i); }} style={{ position: 'relative', display: 'block' }}>
                            <div className="pack_wrap_2xjIs pack_vertical_ilL2U" style={{ width: 172, height: 96 }}>
                              <div className="pack_img_wrap_3sS_W" style={{ width: '100%', height: '100%' }}>
                                <img className="pack_img_YJm41" src={item.image} alt={item.title}
                                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                                {isActive ? <div className="bullet_active_2WZgk" /> : <div className="bullet_shadow_283GL" />}
                              </div>
                              {item.title && (
                                <div className="lb_texts_wrap_1o6QN">
                                  <span className="lb_texts_23IEZ" style={{ fontFamily: 'Arial, sans-serif' }}>{item.title}</span>
                                </div>
                              )}
                            </div>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile dot indicators */}
          <div className="hero-dots-mobile">
            {carouselItems.slice(0, 8).map((_, i) => (
              <div key={i} onClick={() => goTo(i)}
                style={{ width: i === current ? 18 : 6, height: 6, borderRadius: 3, background: i === current ? '#e50914' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
        <div className="swiper_right_shadow_1Q1Dm" />
      </div>
    );
  }

  const slide = swiperSlides[current];
  return (
    <div className="swiper_wrap_3_CON"
      onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
      onMouseLeave={startTimer}>
      <div className="swiper_container_custom">
        <div className="swiper-wrapper">
          {swiperSlides.map((s, i) => (
            <div key={s.id} className={`swiper-slide${i === current ? ' active' : ''}`}>
              <div className="swiper_item_img_wrap_2vvR2">
                <div className={s.id === '7' ? 'swiper_political_img_QmWai' : 'swiper_show_img_qwMgx'}>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/play/1'); }}>
                    <img src={s.image} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </a>
                  <div className="img_top_shadow_1Jl5Y" />
                  <div className="img_left_shadow_3uQE-" />
                  <div className="img_bottom_shadow_3gdlg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pagination_info_wrap_2djxx">
        <div className="swiper_item_info_wrap_xr4-T">
          <div className="swiper_item_info_CFKcC" style={{ display: 'block' }}>
            <div style={{ transformOrigin: 'left bottom' }}>
              {slide.titleArtUrl ? (
                <div className={`title_icon_3OEty title_icon_${slide.titleArtStyle === 'square' ? 'square_22rwp' : slide.titleArtStyle === 'horizontal_big' ? 'horizontal_big_tqLXc' : 'horizontal_Gs-ty'}`}>
                  <img src={slide.titleArtUrl} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              ) : slide.titleText ? (
                <div className="swiper_item_title_1gdGI" style={{ fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>{slide.titleText}</div>
              ) : null}
            </div>
            {!slide.isAd && slide.tags.length > 0 && (
              <div className="item_wrap_3czPf">
                <div className="item_2wPCe">
                  <div className="swiper_item_tags_3qvRt">
                    {slide.tags.map((tag, ti) => (
                      <div key={ti} className={`tag_2AESO ${tag.type === 'vip' ? 'tag12_22zKy' : tag.type === 'exclusive' ? 'tag11_39Lg0' : tag.type === 'ad' ? 'tag199999_1wL9K' : 'tag1__xbWn'}`}>
                        <span style={{ fontFamily: 'Arial, sans-serif' }}>{tag.text}</span>
                      </div>
                    ))}
                  </div>
                  {slide.desc && <div className="swiper_item_desc_1pk_I no_reason_p0187" style={{ fontFamily: 'Arial, sans-serif' }}>{slide.desc}</div>}
                </div>
                <div className="swiper_item_control_1C-Qx">
                  <div className="control_btn_wrap_3w0t8">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/play/1'); }}>
                      <div className="swiper_item_play_btn_3oJP-">
                        <span className="play_icon_2lZmx">▶</span>
                        <span className="play_btn_text_1x4lT" style={{ fontFamily: 'Arial, sans-serif' }}>PLAY</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="custom_pagination_wrap_zvWry hero-pagination-desktop">
          <div className="hscroll_wrapper_3CJzY">
            <div className="hscroll_content_fdYOj">
              <div className="card_container_1U0e6">
                {bulletCards.slice(0, 7).map((bullet) => {
                  const isActive = bullet.slideIndex === current;
                  return (
                    <div key={bullet.id} className="bullet_wrap_1yE2X g-col-swiper" onClick={() => goTo(bullet.slideIndex)}>
                      <div className="yk_card_368vl">
                        <a href="#" onClick={(e) => { e.preventDefault(); goTo(bullet.slideIndex); }} style={{ position: 'relative', display: 'block' }}>
                          <div className="pack_wrap_2xjIs pack_vertical_ilL2U" style={{ width: 172, height: 96 }}>
                            <div className="pack_img_wrap_3sS_W" style={{ width: '100%', height: '100%' }}>
                              <img className="pack_img_YJm41" src={bullet.image} alt=""
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              {isActive ? <div className="bullet_active_2WZgk" /> : <div className="bullet_shadow_283GL" />}
                            </div>
                            {bullet.badgeType && bullet.badgeText && (
                              <div className={`pack_mark_1hLkl ${bullet.badgeType === 'vip' ? 'tag_YELLOW_3uzKD' : bullet.badgeType === 'exclusive' ? 'tag_RED_2-nUp' : bullet.badgeType === 'premiere' ? 'tag_BLUE_o8YDy' : bullet.badgeType === 'svip' ? 'tag_SVIP_COLORFUL_2rSkq' : 'tag_ad_XOHyW'} null`}>
                                <span style={{ fontFamily: 'Arial, sans-serif' }}>{bullet.badgeText}</span>
                              </div>
                            )}
                            {bullet.statusText && (
                              <div className="newSummaryLeft_2WuF0 undefined">
                                <div className="newSummaryLeftText_22TVB" style={{ fontFamily: 'Arial, sans-serif' }}>{bullet.statusText}</div>
                                <div className="newSummaryLeftSubTitle_3gXo1" style={{ fontFamily: 'Arial, sans-serif' }}>{bullet.statusSub}</div>
                              </div>
                            )}
                            {bullet.episodeText && (
                              <div className="lb_texts_wrap_1o6QN">
                                <span className="lb_texts_23IEZ" style={{ fontFamily: 'Arial, sans-serif' }}>{bullet.episodeText}</span>
                              </div>
                            )}
                          </div>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-dots-mobile">
          {swiperSlides.slice(0, 8).map((_, i) => (
            <div key={i} onClick={() => goTo(i)}
              style={{ width: i === current ? 18 : 6, height: 6, borderRadius: 3, background: i === current ? '#e50914' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
      <div className="swiper_right_shadow_1Q1Dm" />
    </div>
  );
}
