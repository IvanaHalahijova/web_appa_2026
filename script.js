// ---------------------------------------------
// Inicializácia EmailJS — doplniť svoj public key (emailjs.init)
// ---------------------------------------------
emailjs.init("TVOJ_PUBLIC_KEY"); // ← doplniť sem svoj public key

document.addEventListener("DOMContentLoaded", function () {
    // Debug overlay: odstránil som ho v produkcii

    function addDebug() { /* ticho v produkcii */ }
    
    // ---------------------------------------------
    // Navigácia — efekt pri scrollovaní (chcem, aby sa meniť štýl pri scrollnutí)
    // ---------------------------------------------
    const navbar = document.querySelector(".navbar");
    // Zistí, či sme na podstránke (kde navigačné pozadie má byť viditeľné hneď)
    const isPortfolioPage = document.body.classList.contains('portfolio-body'); 

    if (isPortfolioPage) {
        // Ak sme na podstránke (Portfólio, GDPR), aplikujeme "scrolled" štýl hneď
        navbar.classList.add("scrolled");
        navbar.classList.add("portfolio-page-nav"); 
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else if (!isPortfolioPage) {
            // Ak je Hero sekcia na vrchu (iba na indexe), odstránime scrolled štýl
            navbar.classList.remove("scrolled");
        }
    });

    // ---------------------------------------------
    // Formulár — odosielanie cez EmailJS (upraviť SERVICE/TEMPLATE id)
    // ---------------------------------------------
    const form = document.getElementById("contactForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            
            // Validácia - skontroluj či sú všetky required polia vyplnené
            if (!this.checkValidity()) {
                alert("Prosím, vyplňte všetky povinné polia.");
                return;
            }
            
            const submitBtn = this.querySelector("button[type='submit']");
            const originalText = submitBtn.textContent;

            submitBtn.textContent = "Odosiela sa...";
            submitBtn.disabled = true;

            emailjs.sendForm("TVOJ_SERVICE_ID", "TVOJ_TEMPLATE_ID", this) // ← doplniť svoj SERVICE a TEMPLATE ID
                .then(() => {
                    alert("Ďakujeme! Vaša správa bola úspešne odoslaná.");
                    this.reset();
                })
                .catch(() => {
                    alert("Nastala chyba pri odosielaní. Skúste to znova.");
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Vynútiť tmavú tému pre celú stránku (bez prepínania) — nechcem prepínať
    const body = document.body;
    // Poznámka: vždy pridávam triedu dark-theme
    body.classList.add("dark-theme");

    // Zabezpečiť, aby odkazy 'Viac informácií' fungovali aj pri file:// prehliadaní
    try {
        const moreLinks = document.querySelectorAll('.cookie-more');
        moreLinks.forEach(link => {
            // ak používateľ klikne alebo stlačí Enter na linku, explicitne otvoriť cieľ v novom okne/karte
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                addDebug && addDebug('[cookie-debug] cookie-more clicked, opening: ' + href);
                try {
                    const newWin = window.open(href, '_blank');
                    if (!newWin) {
                        // fallback: create temporary anchor to open new tab
                        const tmp = document.createElement('a');
                        tmp.href = href;
                        tmp.target = '_blank';
                        tmp.rel = 'noopener';
                        document.body.appendChild(tmp);
                        tmp.click();
                        tmp.remove();
                    }
                } catch (err) {
                    try { window.location.href = href; } catch (e) { addDebug && addDebug('[cookie-debug] open href failed: ' + e); }
                }
            });
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });
    } catch (e) { console.warn('[cookie-debug] cookie-more setup error', e); }

    // Chytám interakcie skôr (pointerdown) — aby som stihol spracovať "Súhlas" pred navigáciou alebo formulármi
    document.addEventListener('pointerdown', function (e) {
        try {
            const targetInfo = (e.target && e.target.tagName) + (e.target && e.target.id ? ('#' + e.target.id) : '') + (e.target && e.target.className ? ('.' + e.target.className.split(' ').join('.')) : '');
            addDebug && addDebug('[cookie-debug] pointerdown: target=' + targetInfo + ', x=' + e.clientX + ', y=' + e.clientY);
            const accept = e.target.closest && e.target.closest('#accept-cookies');
            if (accept) {
                // riešim súhlas hneď a blokujem default správanie
                try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
                addDebug && addDebug('[cookie-debug] pointerdown accept detected - storing consent and hiding banner');
                try { setConsent('true'); } catch (err) { /* ignorovať */ }
                if (cookieBanner) {
                    cookieBanner.classList.add('cookie-banner-hidden');
                    cookieBanner.classList.remove('cookie-banner-visible');
                    try {
                        cookieBanner.style.opacity = '0';
                        cookieBanner.style.transform = 'translate(-50%, 8px)';
                        cookieBanner.style.pointerEvents = 'none';
                        cookieBanner.style.display = 'none';
                        setTimeout(() => { try { cookieBanner.remove(); addDebug && addDebug('[cookie-debug] cookieBanner removed from DOM (pointerdown)'); } catch (e) {} }, 200);
                    } catch (e) { addDebug && addDebug('[cookie-debug] pointerdown hide style error: ' + e); }
                }
            }
        } catch (e) { /* ignorovať */ }
    }, true);

    // Delegovaný click handler na zachytenie kliknutí alebo pre prípad, že sa elementy dynamicky nahradia
    document.addEventListener('click', function (e) {
        try {
            addDebug && addDebug('[cookie-debug] global click: target=' + (e.target && e.target.tagName) + ', id=' + (e.target && e.target.id) + ', classes=' + (e.target && e.target.className));
            const accept = e.target.closest && e.target.closest('#accept-cookies');
            if (accept) {
                e.preventDefault();
                e.stopPropagation();
                addDebug && addDebug('[cookie-debug] delegated accept clicked');
                try { setConsent('true'); } catch (err) { /* ignorovať */ }
                if (cookieBanner) {
                    cookieBanner.classList.add('cookie-banner-hidden');
                    cookieBanner.classList.remove('cookie-banner-visible');
                    try {
                        cookieBanner.style.opacity = '0';
                        cookieBanner.style.transform = 'translate(-50%, 8px)';
                        cookieBanner.style.pointerEvents = 'none';
                        cookieBanner.style.display = 'none';
                        // Odstrániť z DOM, aby sa predišlo vedľajším efektom
                        setTimeout(() => { try { cookieBanner.remove(); addDebug && addDebug('[cookie-debug] cookieBanner removed from DOM'); } catch (e) {} }, 200);
                    } catch (e) { addDebug && addDebug('[cookie-debug] delegate hide style error: ' + e); }
                }
            }
        } catch (e) { /* ignorovať */ }
    });




    // Na indexe chcem byť na vrchu, ale ak prídem z inej podstránky na #kotvu, nech stránka skočí na ňu (zachovať kotvy pri navigácii)
    if (!isPortfolioPage) {
        // Prevent browser from restoring previous scroll position on refresh
        try {
            if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        } catch (e) {}

        // Detect navigation type: 'navigate' (link), 'reload', or 'back_forward'
        let navType = 'navigate';
        try {
            const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
            const nav = navEntries && navEntries[0];
            if (nav && nav.type) navType = nav.type;
            else if (performance.navigation && typeof performance.navigation.type === 'number') {
                navType = performance.navigation.type === 1 ? 'reload' : (performance.navigation.type === 2 ? 'back_forward' : 'navigate');
            }
        } catch (e) { /* ignorovať */ }

        // Ak ide o reload alebo back/forward, odstránim hash aby sa neobnovila stará pozícia
        if ((navType === 'reload' || navType === 'back_forward') && window.location.hash) {
            try { history.replaceState(null, null, window.location.pathname + window.location.search); } catch (e) {}
            window.scrollTo(0,0);
        } else if (!window.location.hash) {
            // Žiadna kotva (hash): posun na začiatok stránky
            window.scrollTo(0,0);
        } else {
            // There's a hash and it's a normal navigation (e.g., user clicked a link from another page) — scroll to the anchor
            try {
                const id = window.location.hash.slice(1);
                const el = document.getElementById(id);
                if (el) {
                    // krátke oneskorenie, aby sa rozloženie (layout) stihlo vykresliť
                    setTimeout(() => { try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { window.scrollTo(0, el.offsetTop || 0); } }, 50);
                } else {
                    window.scrollTo(0,0);
                }
            } catch (e) { window.scrollTo(0,0); }
        }
    }
    // ---------------------------------------------
    // 🍪 Cookies Lišta
    // ---------------------------------------------
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptButton = document.getElementById("accept-cookies");
    const cookieName = "appa_cookies_accepted";

    // Ak chceš zakázať agresívny cookie fallback (užitočné v produkcii),
    // nastav data-disable-cookie-fallback="true" na #cookie-banner alebo na <body>.
    const cookieFallbackDisabled = Boolean(
        (cookieBanner && cookieBanner.dataset && cookieBanner.dataset.disableCookieFallback === 'true') ||
        (document.body && document.body.dataset && document.body.dataset.disableCookieFallback === 'true')
    );

    // Funkcie pre ukladanie súhlasu (uprednostniť localStorage, cookie fallback pre prísne/režimy ochrany súkromia)
    function setConsent(value) {
        try { localStorage.setItem(cookieName, String(value)); return; } catch (e) {}
        try {
            const exDays = 365;
            const d = new Date(); d.setTime(d.getTime() + exDays * 24 * 60 * 60 * 1000);
            document.cookie = cookieName + "=" + encodeURIComponent(value) + "; path=/; expires=" + d.toUTCString() + "; SameSite=Lax";
        } catch (e) {}
    }
    function getConsent() {
        try { const v = localStorage.getItem(cookieName); if (v !== null) return v; } catch (e) {}
        try { const m = document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)'); return m ? decodeURIComponent(m[2]) : null; } catch (e) { return null; }
    }

    // Vývojárske testovacie nástroje: umožňujú spustiť automatizované testy pre súhlas
    window.appaConsent = window.appaConsent || {};
    window.appaConsent.getConsent = getConsent;
    window.appaConsent.setConsent = setConsent;
    window.appaConsent.clearConsent = function() {
        try { localStorage.removeItem(cookieName); } catch (e) {}
        try { document.cookie = cookieName + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'; } catch (e) {}
    };

    window.appaConsent.runTests = async function() {
        const results = [];
        try {
            // 1) Clear any existing consent
            window.appaConsent.clearConsent();
            results.push({step:'clear', ok: getConsent() === null});

            // 2) Set to 'true' and verify
            setConsent('true');
            await new Promise(r => setTimeout(r, 50));
            results.push({step:'set-true', value: getConsent(), ok: getConsent() === 'true'});

            // 3) Clear and set to 'false'
            window.appaConsent.clearConsent();
            setConsent('false');
            await new Promise(r => setTimeout(r, 50));
            results.push({step:'set-false', value: getConsent(), ok: getConsent() === 'false'});

            // 4) Test cookie fallback by forcing localStorage.setItem/getItem to throw
            let origSet = null, origGet = null;
            try {
                origSet = localStorage.setItem; origGet = localStorage.getItem;
                localStorage.setItem = function(){ throw new Error('simulated blocked storage'); };
                localStorage.getItem = function(){ throw new Error('simulated blocked storage'); };

                window.appaConsent.clearConsent();
                setConsent('true');
                await new Promise(r => setTimeout(r, 50));
                const v = (function(){ try { const m = document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)'); return m ? decodeURIComponent(m[2]) : null; } catch(e){ return null; } })();
                results.push({step:'cookie-fallback', cookieValue: v, ok: v === 'true'});
            } catch(e) {
                results.push({step:'cookie-fallback-error', error: String(e)});
            } finally {
                try { if (origSet) localStorage.setItem = origSet; if (origGet) localStorage.getItem = origGet; } catch(e) {}
            }

            // 5) Clean up
            window.appaConsent.clearConsent();
            results.push({step:'cleanup', ok: getConsent() === null});

            console.group('appaConsent runTests result');
            results.forEach(r => console.info(r));
            console.groupEnd();
            return results;
        } catch (e) {
            console.error('appaConsent runTests failed', e);
            return [{error: String(e)}];
        }
    };

    // Koniec vývojárskych testov

    // Funkcia na zobrazenie lišty
    function showCookieBanner() {
        if (!cookieBanner) { addDebug && addDebug('[cookie-debug] showCookieBanner: banner element missing'); return; }
        if (!getConsent()) {
            // zobraziť lištu, ak ešte nie je uložený súhlas
            cookieBanner.classList.add("cookie-banner-visible");
            cookieBanner.classList.remove("cookie-banner-hidden");
            // Zabezpečiť viditeľnosť aj keby CSS niečo skreslilo (fallback na inline štýly)
            try {
                cookieBanner.style.display = 'block';
                cookieBanner.style.visibility = 'visible';
                cookieBanner.style.opacity = '1';
                try {
                    // používať setProperty s 'important', aby sa prepísali iné zdroje CSS
                    cookieBanner.style.setProperty('position','fixed','important');
                    cookieBanner.style.setProperty('left','50%','important');
                    cookieBanner.style.setProperty('right','auto','important');
                    cookieBanner.style.setProperty('bottom','28px','important');
                    cookieBanner.style.setProperty('transform','translate3d(-50%,0,0)','important');
                    cookieBanner.style.setProperty('pointer-events','auto','important');
                    cookieBanner.style.setProperty('z-index','100001','important');
                    cookieBanner.style.setProperty('width','auto','important');
                    cookieBanner.style.setProperty('max-width','calc(100% - 24px)','important');
                } catch (e) { addDebug && addDebug('[cookie-debug] show style setProperty error: ' + e); }

                addDebug && addDebug('[cookie-debug] showCookieBanner: bounding rects and occlusion check');
                try {
                    const bannerRect = cookieBanner.getBoundingClientRect();
                    addDebug && addDebug('[cookie-debug] banner rect: left=' + bannerRect.left + ' right=' + bannerRect.right + ' top=' + bannerRect.top + ' bottom=' + bannerRect.bottom + ' width=' + bannerRect.width);
                    if (acceptButton) {
                        const rect = acceptButton.getBoundingClientRect();
                        addDebug && addDebug('[cookie-debug] acceptButton rect: left=' + rect.left + ' top=' + rect.top + ' width=' + rect.width + ' height=' + rect.height);
                        const cx = rect.left + rect.width/2;
                        const cy = rect.top + rect.height/2;
                        const hit = document.elementFromPoint(cx, cy);
                        addDebug && addDebug('[cookie-debug] elementFromPoint at accept center: tag=' + (hit && hit.tagName) + ' id=' + (hit && hit.id) + ' classes=' + (hit && hit.className));
                        if (hit !== acceptButton) {
                            addDebug && addDebug('[cookie-debug] acceptButton occluded by another element; forcing z-index and pointer-events');
                            try { acceptButton.style.setProperty('z-index','100002','important'); acceptButton.style.setProperty('position','relative','important'); acceptButton.style.setProperty('pointer-events','auto','important'); } catch(e) {}
                        }
                    }
                } catch(e) { addDebug && addDebug('[cookie-debug] showCookieBanner debug error: ' + e); }
            } catch (e) { addDebug && addDebug('[cookie-debug] show style error: ' + e); }
        } else { addDebug && addDebug('[cookie-debug] showCookieBanner: consent already set'); }
    }

    // Funkcia na skrytie lišty a uloženie súhlasu
    if (acceptButton) {
        // Zjednotiť akciu 'Súhlas' aby ju volali rôzne handlery
        function acceptAction(origin) {
            addDebug && addDebug('[cookie-debug] acceptAction triggered by ' + origin);
            try { setConsent('true'); } catch (err) { /* ignorovať */ }

            if (cookieBanner) {
                cookieBanner.classList.add("cookie-banner-hidden");
                cookieBanner.classList.remove("cookie-banner-visible");
                try {
                    cookieBanner.style.opacity = '0';
                    cookieBanner.style.transform = 'translate(-50%, 8px)';
                    cookieBanner.style.pointerEvents = 'none';
                    cookieBanner.style.display = 'none';
                    // Odstrániť banner z DOM, aby sa už nezobrazoval znovu
                    setTimeout(() => { try { cookieBanner.remove(); addDebug && addDebug('[cookie-debug] cookieBanner removed from DOM (acceptAction)'); } catch (e) {} }, 100);
                } catch (e) { addDebug && addDebug('[cookie-debug] hide style error: ' + e); }
            }

            // debug: vypíš obrys tlačidla 'Súhlas' a jeho computed style (prechodné info)
            try {
                const rect = acceptButton.getBoundingClientRect();
                const cs = window.getComputedStyle(acceptButton);
                addDebug && addDebug('[cookie-debug] acceptButton rect: left=' + rect.left + ' top=' + rect.top + ' width=' + rect.width + ' height=' + rect.height);
                addDebug && addDebug('[cookie-debug] acceptButton computedStyle: zIndex=' + cs.zIndex + ' pointerEvents=' + cs.pointerEvents + ' position=' + cs.position);
            } catch(e) { addDebug && addDebug('[cookie-debug] acceptAction debug error: ' + e); }

            // final check
            try { setTimeout(() => { addDebug && addDebug('[cookie-debug] accept: final check, hasConsent=' + !!localStorage.getItem(cookieName)); }, 50); } catch (e) {}
        }

        // pointerdown capture handler — runs early to avoid navigations / other handlers
        acceptButton.addEventListener('pointerdown', function (e) {
            try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
            acceptAction('pointerdown');
        }, { capture: true });

        // also handle click
        acceptButton.addEventListener('click', function (e) {
            try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
            acceptAction('click');
        });

        // Spracovanie Nesúhlasím — prítomnosť hodnoty ukladám ako rozhodnutie používateľa
        const declineButton = document.getElementById('decline-cookies');
        if (declineButton) {
            function declineAction(origin) {
                addDebug && addDebug('[cookie-debug] declineAction triggered by ' + origin);
                try { setConsent('false'); } catch (err) { /* ignorovať */ }
                if (cookieBanner) {
                    cookieBanner.classList.add('cookie-banner-hidden');
                    cookieBanner.classList.remove('cookie-banner-visible');
                    try {
                        cookieBanner.style.opacity = '0';
                        cookieBanner.style.transform = 'translate(-50%, 8px)';
                        cookieBanner.style.pointerEvents = 'none';
                        cookieBanner.style.display = 'none';
                        setTimeout(() => { try { cookieBanner.remove(); addDebug && addDebug('[cookie-debug] cookieBanner removed from DOM (declineAction)'); } catch (e) {} }, 100);
                    } catch (e) { addDebug && addDebug('[cookie-debug] decline hide style error: ' + e); }
                }
                try { setTimeout(() => { addDebug && addDebug('[cookie-debug] decline: final check, value=' + localStorage.getItem(cookieName)); }, 50); } catch (e) {}
            }

            declineButton.addEventListener('pointerdown', function (e) {
                try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
                declineAction('pointerdown');
            }, { capture: true });

            declineButton.addEventListener('click', function (e) {
                try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
                declineAction('click');
            });
        }
    }

    // Zobrazenie lišty po krátkej chvíli (na všetkých stránkach, ak ešte nie je súhlas)
    // Voláme viackrát ako fallback pre file:// prostredie (niekedy sa DOM alebo CSS spracuje neskôr)
    try { showCookieBanner(); } catch (e) {}
    setTimeout(showCookieBanner, 700);
    setTimeout(showCookieBanner, 1400);

    // Fallback / debug: ak sa lišta nezobrazí (CSS preklep alebo iné), vynútime ju po krátkej chvíli
    setTimeout(() => {
        try {
            const hasConsent = !!getConsent();
            if (!cookieBanner) {
                console.warn('[cookie-debug] element nenájdený');
                return;
            }
            console.warn('[cookie-debug] fallback check - hasConsent:', hasConsent, 'classList:', cookieBanner.className);
            addDebug && addDebug('[cookie-debug] fallback check - hasConsent: ' + hasConsent + ', classList: ' + cookieBanner.className);
            if (!hasConsent) {
                // vynútíme zobrazenie a vypíšeme computed style pre debug
                addDebug && addDebug('[cookie-debug] fallback: no consent -> calling showCookieBanner()');
                showCookieBanner();
                try {
                    const cs = window.getComputedStyle(cookieBanner);

                    addDebug && addDebug('[cookie-debug] computed style: display=' + cs.display + ' visibility=' + cs.visibility + ' opacity=' + cs.opacity + ' bottom=' + cs.bottom + ' top=' + cs.top + ' transform=' + cs.transform + ' position=' + cs.position + ' left=' + cs.left + ' right=' + cs.right + ' width=' + cs.width);

                    // Aplikovať agresívny fallback iba ak je povolený a potrebný: nesprávna pozícia / veľký transform / tlačidlo Súhlas prekryté (occluded)
                    const transformX = cs.transform && cs.transform.includes('matrix') ? cs.transform : '';

                    // quick occlusion check for acceptButton
                    let acceptOccluded = false;
                    try {
                        if (acceptButton) {
                            const rect = acceptButton.getBoundingClientRect();
                            const cx = rect.left + rect.width / 2;
                            const cy = rect.top + rect.height / 2;
                            const hit = document.elementFromPoint(cx, cy);
                            if (hit !== acceptButton) acceptOccluded = true;
                        }
                    } catch (e) { /* ignorovať */ }

                    if (!cookieFallbackDisabled && (cs.bottom === 'auto' || transformX.includes('-') || cs.position !== 'fixed' || acceptOccluded)) {
                        addDebug && addDebug('[cookie-debug] applying aggressive inline styles to force banner visible (restricted)');
                        try {
                            cookieBanner.style.setProperty('position','fixed','important');
                            cookieBanner.style.setProperty('left','50%','important');
                            cookieBanner.style.setProperty('right','auto','important');
                            cookieBanner.style.setProperty('bottom','28px','important');
                            cookieBanner.style.setProperty('top','auto','important');
                            cookieBanner.style.setProperty('transform','translate3d(-50%,0,0)','important');
                            cookieBanner.style.setProperty('width','auto','important');
                            cookieBanner.style.setProperty('max-width','calc(100% - 24px)','important');
                            cookieBanner.style.setProperty('display','block','important');
                            cookieBanner.style.setProperty('visibility','visible','important');
                            cookieBanner.style.setProperty('opacity','1','important');
                            cookieBanner.style.setProperty('pointer-events','auto','important');
                            cookieBanner.style.setProperty('z-index','100001','important');
                        } catch (e) { addDebug && addDebug('[cookie-debug] restricted fallback setProperty error: ' + e); }

                        // extra sanity checks: log rects and element at accept center
                        try {
                            const bannerRect2 = cookieBanner.getBoundingClientRect();
                            addDebug && addDebug('[cookie-debug] fallback banner rect: left=' + bannerRect2.left + ' right=' + bannerRect2.right + ' top=' + bannerRect2.top + ' bottom=' + bannerRect2.bottom + ' width=' + bannerRect2.width);
                            if (acceptButton) {
                                const rect2 = acceptButton.getBoundingClientRect();
                                addDebug && addDebug('[cookie-debug] fallback acceptButton rect: left=' + rect2.left + ' top=' + rect2.top + ' width=' + rect2.width + ' height=' + rect2.height);
                                const cx2 = rect2.left + rect2.width/2;
                                const cy2 = rect2.top + rect2.height/2;
                                const hit2 = document.elementFromPoint(cx2, cy2);
                                addDebug && addDebug('[cookie-debug] fallback elementFromPoint at accept center: tag=' + (hit2 && hit2.tagName) + ' id=' + (hit2 && hit2.id) + ' classes=' + (hit2 && hit2.className));
                                if (hit2 !== acceptButton) {
                                    addDebug && addDebug('[cookie-debug] fallback: acceptButton occluded; forcing z-index on accept');
                                    try { acceptButton.style.setProperty('z-index','100002','important'); acceptButton.style.setProperty('position','relative','important'); acceptButton.style.setProperty('pointer-events','auto','important'); } catch(e) {}
                                }
                            }
                        } catch(e) { addDebug && addDebug('[cookie-debug] fallback debug error: ' + e); }

                        // log computed style after forcing inline styles
                        try {
                            const cs2 = window.getComputedStyle(cookieBanner);
                            addDebug && addDebug('[cookie-debug] computed style after forcing: display=' + cs2.display + ' visibility=' + cs2.visibility + ' opacity=' + cs2.opacity + ' position=' + cs2.position + ' left=' + cs2.left + ' right=' + cs2.right + ' bottom=' + cs2.bottom + ' transform=' + cs2.transform);
                            } catch (e){ /* ignorovať */ }
                    }
                } catch (e) { console.warn('[cookie-debug] computedStyle error', e); addDebug && addDebug('[cookie-debug] computedStyle error: ' + e); }
            }
        } catch (e) { console.warn('Cookie fallback error', e); addDebug && addDebug('[cookie-debug] Cookie fallback error: ' + e); }
    }, 1200);
    
});