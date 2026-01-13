// Funkčné vyhľadávanie — modal + live search nad obsahom webu
// Zamerané na kľúčové slová bežného zákazníka (projekty, interiéry, rodinné domy, kontakt, ceny...)
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        const searchToggle = document.querySelector(".search-toggle");
        const searchModal = document.querySelector("#searchModal");
        const searchInput = document.querySelector("#searchInput");
        const searchResults = document.querySelector("#searchResults");

        if (!searchToggle || !searchModal || !searchInput || !searchResults) {
            console.warn('[search] Modal alebo input neexistuje');
            return;
        }

        // Jednoduchá normalizácia textu (odstráni diakritiku, zmení na lowercase)
        const norm = (s) => (s || "")
            .toString()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase();

        // Vyhľadávacia databáza (bežné požiadavky klientov, nie názvy súborov)
        const searchData = [
            {
                title: "Portfólio – rodinné domy",
                desc: "Návrh a vizualizácie rodinných domov, projekty na stavebné povolenie.",
                href: "portfolio.html",
                tags: ["rodinny dom", "rodinné domy", "projekt domu", "stavebne povolenie", "vizualizacia domu", "architekt pre rodinny dom", "bungalov", "moderny dom", "novostavba"]
            },
            {
                title: "Portfólio – interiéry",
                desc: "Interiérový dizajn, dispozičné riešenia, vizualizácie interiérov.",
                href: "portfolio.html",
                tags: ["interier", "interiery", "interierovy dizajn", "navrh interieru", "dispozicia", "kuchyna", "obyvacka", "kupelna", "vizualizacia interieru", "rekonstrukcia bytu"]
            },
            {
                title: "Portfólio – bytové/obytné domy",
                desc: "Bytové a obytné domy, hromadné bývanie, architektonické štúdie.",
                href: "portfolio.html",
                tags: ["bytovy dom", "obytny dom", "architektonicka studia", "projekt bytoveho domu", "urbanizmus", "developer"]
            },
            {
                title: "Portfólio – komerčné priestory",
                desc: "Kancelárie, coworking, kaviarne, showroomy, obchodné priestory.",
                href: "portfolio.html",
                tags: ["komercne priestory", "kancelaria", "coworking", "kaviaren", "showroom", "obchod", "retail", "office"]
            },
            {
                title: "Vizualizácie exteriérov",
                desc: "Realistické vizualizácie exteriérov a urbanistických celkov.",
                href: "portfolio.html",
                tags: ["vizualizacia exterieru", "3d vizualizacia", "exterier", "urbanizmus", "krajinny navrh", "render"]
            },
            {
                title: "Služby – architektonický návrh",
                desc: "Kompletný návrh od štúdie až po projekt pre stavebné povolenie.",
                href: "#onas",
                tags: ["architekt", "navrh domu", "architektonicky navrh", "projekt", "stavebne povolenie", "projektant", "appa", "studia"]
            },
            {
                title: "Dispozičné riešenia a rekonštrukcie",
                desc: "Návrh dispozície, rekonštrukcia interiéru, redizajn bývania.",
                href: "#onas",
                tags: ["rekonstrukcia", "rekonštrukcia", "dispozicia bytu", "redizajn", "zmena dispozicie", "prestavba", "modernizacia", "interier na mieru"]
            },
            {
                title: "Interiérový dizajn na mieru",
                desc: "Materiálové riešenia, nábytok na mieru, osvetlenie, detail.",
                href: "#portfolio",
                tags: ["interierovy dizajn", "nabytok na mieru", "osvetlenie", "materialy", "farby", "styl", "dizajn", "detail", "kuchyna na mieru"]
            },
            {
                title: "Kontakt a cenová ponuka",
                desc: "Dohodnite si konzultáciu, získajte cenový odhad a termíny.",
                href: "#kontakt",
                tags: ["kontakt", "cenova ponuka", "konzultacia", "stretnutie", "email", "telefon", "otazky", "predbezna cena", "rozpocet", "chcem projekt"]
            },
            {
                title: "Ateliér APPA – Prešov",
                desc: "Architektonické štúdio v Prešove – interiéry, domy, vizualizácie.",
                href: "#onas",
                tags: ["presov", "architekt presov", "atelier appa", "appa", "dizajn", "architektura", "pionierska"]
            },
            {
                title: "Spolupráca a partneri",
                desc: "Partnerstvá s developermi a dodávateľmi, dlhodobá spolupráca.",
                href: "#spolupraca",
                tags: ["spolupraca", "partner", "developer", "dodavatel", "referencie"]
            },
            {
                title: "GDPR a cookies",
                desc: "Informácie o spracovaní osobných údajov a súboroch cookies.",
                href: "gdpr.html#gdpr-text",
                tags: ["gdpr", "cookies", "osobne udaje", "suhlas", "ochrana sukromia"]
            }
        ];

        const normalizedData = searchData.map(item => ({
            ...item,
            _title: norm(item.title),
            _desc: norm(item.desc),
            _tags: item.tags.map(norm)
        }));

        // Otvorenie modalu pri kliknutí na lupu
        searchToggle.addEventListener("click", (e) => {
            e.preventDefault();
            try {
                const modal = new bootstrap.Modal(searchModal);
                modal.show();
                setTimeout(() => searchInput.focus(), 300);
            } catch (err) {
                console.error('[search] Chyba pri otváraní modalu:', err);
            }
        });

        // Vyhľadávanie v reálnom čase
        searchInput.addEventListener("input", function () {
            const rawQuery = this.value.trim();
            const query = norm(rawQuery);
            if (query.length < 2) {
                searchResults.innerHTML = '<p class="text-muted">Zadajte aspoň 2 znaky na vyhľadávanie</p>';
                return;
            }

            const results = normalizedData
                .map(item => {
                    const hitTitle = item._title.includes(query);
                    const hitDesc = item._desc.includes(query);
                    const hitTag = item._tags.some(t => t.includes(query));
                    const score = (hitTitle ? 3 : 0) + (hitDesc ? 2 : 0) + (hitTag ? 1 : 0);
                    return { score, item };
                })
                .filter(r => r.score > 0)
                .sort((a, b) => b.score - a.score);

            if (results.length === 0) {
                searchResults.innerHTML = '<p class="text-muted">Nenašli sa žiadne výsledky. Skúste iné kľúčové slovo, napr. "rodinný dom", "interiér", "vizualizácia", "kontakt".</p>';
                return;
            }

            searchResults.innerHTML = results.map(r => {
                const { title, desc, href } = r.item;
                return `
                    <div class="search-result-item mb-2 p-2 border-bottom">
                        <a href="${href}" class="text-decoration-none text-light" data-bs-dismiss="modal">
                            <strong>${title}</strong><br/>
                            <small class="text-muted">${desc}</small>
                        </a>
                    </div>`;
            }).join('');
        });
    }, 100);
});
