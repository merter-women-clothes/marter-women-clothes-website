import React, { useEffect, useRef, useState } from 'react';

export default function TelegramVideo({ post, poster }) {
  const embedRef = useRef(null);
  const [activated, setActivated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = embedRef.current;
    if (!container || !activated) return undefined;

    setReady(false);
    container.replaceChildren();

    const observer = new MutationObserver(() => {
      const frame = container.querySelector('iframe');
      if (!frame) return;
      frame.addEventListener('load', () => setReady(true), { once: true });
    });

    observer.observe(container, { childList: true, subtree: true });

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-post', post);
    script.setAttribute('data-width', '100%');
    script.setAttribute('data-userpic', 'false');
    container.appendChild(script);

    return () => {
      observer.disconnect();
      container.replaceChildren();
    };
  }, [post, activated]);

  return (
    <div className={`telegram-video ${ready ? 'is-ready' : ''}`}>
      <button
        type="button"
        className="telegram-video-fallback"
        onClick={() => setActivated(true)}
        aria-label="تشغيل فيديو الموديل على تيليجرام"
      >
        <img src={poster} alt="معاينة فيديو الموديل" />
        <span className="telegram-video-shade" />
        <span className="telegram-play" aria-hidden="true">
          <i />
        </span>
        <span className="telegram-video-label">
          <small>فيديو حقيقي للموديل</small>
          <b>اضغط للمشاهدة</b>
        </span>
      </button>
      <div className="telegram-embed" ref={embedRef} aria-label="فيديو الموديل من قناة مارتر" />
    </div>
  );
}
