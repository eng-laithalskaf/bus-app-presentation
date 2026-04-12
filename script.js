/* ============================================
   Bus App Presentation - Interactive Engine
   ============================================
   NOTE: All text content lives in content.js
         This file handles only logic & behavior.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ── Configuration ──
    // TOTAL_SLIDES is derived dynamically from content.js
    const TOTAL_SLIDES = (window.slidesData || []).length || 16;
    let currentSlide = 1;
    let notesVisible = false;
    let touchStartX = 0;
    let touchStartY = 0;

    // ── DOM Elements ──
    const progressBar = document.getElementById('progressBar');
    const slideCounter = document.getElementById('slideCounter');
    const notesPanel = document.getElementById('notesPanel');
    const notesContent = document.getElementById('notesContent');
    const notesToggle = document.getElementById('notesToggle');
    const slidesContainer = document.getElementById('slidesContainer');

    // ══════════════════════════════════════════════════════════════
    //  SlideRenderer — يُحوّل window.slidesData إلى HTML في الـ DOM
    //  للتعديل على المحتوى: افتح content.js فقط
    // ══════════════════════════════════════════════════════════════
    class SlideRenderer {

        /** نقطة الدخول الوحيدة: يمرر كل شريحة لمولّدها المناسب */
        static renderAll(slides, container) {
            if (!container || !slides?.length) return;
            container.innerHTML = slides
                .map((slide, idx) => SlideRenderer._buildSlide(slide, idx))
                .join('');
        }

        static _buildSlide(slide, idx) {
            const isFirst = idx === 0;
            const builders = {
                'title': SlideRenderer._title,
                'about': SlideRenderer._about,
                'pain': SlideRenderer._pain,
                'benchmark': SlideRenderer._benchmark,
                'strategic-vision': SlideRenderer._strategicVision,
                'journey': SlideRenderer._journey,
                'setup': SlideRenderer._setup,
                'tech': SlideRenderer._tech,
                'architecture': SlideRenderer._architecture,
                'compliance': SlideRenderer._compliance,
                'ask': SlideRenderer._ask,
                'timeline': SlideRenderer._timeline,
                'conclusion': SlideRenderer._conclusion,
                'closing': SlideRenderer._closing,
            };
            const build = builders[slide.type];
            const body = build ? build(slide.data) : `<div class="content-card"><p>نوع غير معروف: ${slide.type}</p></div>`;
            const notes = slide.speakerNotes
                ? `<div class="speaker-note-data" style="display:none;">${slide.speakerNotes}</div>`
                : '';
            return `<div class="slide${isFirst ? ' active' : ''}" id="slide${slide.id}">${body}${notes}</div>`;
        }

        // ─── مولّدات الأنواع ────────────────────────────────────────

        static _title(d) {
            return `
            <div class="content-card text-center">
                <h1 class="anim" style="--anim-order:1">${d.mainTitle}<br>
                    <span class="gradient-text">${d.accentTitle}</span>
                </h1>
                <p class="anim" style="--anim-order:2">${d.description}</p>
                <div class="slide-footer anim" style="--anim-order:3">
                    <p class="date-text">${d.date}</p>
                </div>
            </div>`;
        }

        static _about(d) {
            const cards = d.items.map((item, i) => `
                <div class="about-card anim" style="--anim-order:${i + 1}">
                    <i class="${item.icon}" style="color:${item.color};"></i>
                    <div><h3>${item.title}</h3><p>${item.text}</p></div>
                </div>`).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <div class="about-grid">${cards}</div>
                <div class="about-mission anim" style="--anim-order:${d.items.length + 1}">
                    <p><i class="fas fa-bullseye" style="color:var(--gold);margin-left:.5rem;"></i>${d.mission}</p>
                </div>
            </div>`;
        }

        static _pain(d) {
            const cards = d.items.map((item, i) => `
                <div class="pain-card anim" style="--anim-order:${i + 1}">
                    <h3><i class="${item.icon}"></i> ${item.title}</h3>
                    <p>${item.text}</p>
                </div>`).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <div class="pain-grid pain-grid--3col">${cards}</div>
            </div>`;
        }

        static _benchmark(d) {
            const headerCells = d.headers.map(h => `<th>${h}</th>`).join('');
            const rows = d.rows.map(row => `<tr>
                <td>${row[0]}</td>
                <td class="status-bad">${row[1]}</td>
                <td>${row[2]}</td>
                <td class="status-good">${row[3]}</td>
            </tr>`).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <table class="benchmark-table anim" style="--anim-order:1">
                    <thead><tr>${headerCells}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
        }

        static _strategicVision(d) {
            // Build node HTML
            const nodeHtml = d.nodes.map(n => `
                <div class="clickable-node" onclick="showImpact('${n.id}')">
                    <div class="node${n.color === 'gold' ? ' node--gold' : ''} pulse">
                        <i class="${n.icon}"></i><span>${n.label}</span>
                    </div>
                </div>`).join('');

            // Build connector lines with explicit absolute positioning
            // Connector 1 sits between node 1 (left) and node 2 (center)
            // Connector 2 sits between node 2 (center) and node 3 (right)
            const connectors = `
                <div class="connector" style="width:20%;left:25%;top:50%;transform:translateY(-50%);"></div>
                <div class="connector" style="width:20%;right:25%;top:50%;transform:translateY(-50%);"></div>`;

            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <p class="anim" style="--anim-order:1">${d.description}</p>
                <div class="diagram-container anim" style="--anim-order:2">
                    ${nodeHtml}
                    ${connectors}
                </div>
            </div>`;
        }

        static _journey(d) {
            const typeMap = { accent: '', gold: ' journey-step--gold', success: ' journey-step--success' };
            const steps = d.steps.map((step, i) => `
                <div class="journey-step${typeMap[step.type] || ''} anim" style="--anim-order:${i + 1}">
                    <span class="step-label step-label--${step.type}">${step.label}</span>
                    <p>${step.text}</p>
                </div>`).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <div class="journey-grid">${steps}</div>
            </div>`;
        }

        static _setup(d) {
            const cards = d.items.map((item, i) => `
                <div class="setup-card anim" style="--anim-order:${i + 1}">
                    <i class="${item.icon}" style="color:${item.color};"></i>
                    <div><h3>${item.title}</h3><p>${item.text}</p></div>
                </div>`).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <div class="setup-grid">${cards}</div>
            </div>`;
        }

        static _tech(d) {
            const boxes = d.items.map((item, i) => {
                const scanLine = item.action === 'simulateScan' ? '<div class="scan-line"></div>' : '';
                return `
                <div class="tech-box anim" style="--anim-order:${i + 2}" onclick="${item.action}(this)">
                    ${scanLine}
                    <i class="${item.icon}"></i>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                </div>`;
            }).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <p class="anim" style="--anim-order:1">${d.description}</p>
                <div class="tech-grid">${boxes}</div>
            </div>`;
        }

        static _architecture(d) {
            const cards = d.items.map((item, i) => `
                <div class="arch-card anim" style="--anim-order:${i + 1}">
                    <i class="${item.icon}" style="color:${item.color};"></i>
                    <h3>${item.title}</h3><p>${item.text}</p>
                </div>`).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <div class="arch-grid">${cards}</div>
            </div>`;
        }

        static _compliance(d) {
            const modifiers = ['', ' compliance-item--accent', ' compliance-item--success'];
            const items = d.items.map((item, i) => `
                <div class="compliance-item${modifiers[i] || ''} anim" style="--anim-order:${i + 1}">
                    <i class="${item.icon}" style="color:${item.color};"></i>
                    <div><h3>${item.title}</h3><p>${item.text}</p></div>
                </div>`).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <div class="compliance-list">${items}</div>
            </div>`;
        }



        static _ask(d) {
            const colorMap = { gold: 'ask-card--gold', accent: 'ask-card--accent' };
            const cards = d.items.map((item, i) => `
                <div class="ask-card ${colorMap[item.color] || ''} anim" style="--anim-order:${i + 1}">
                    <h3><i class="${item.icon}"></i> ${item.title}</h3>
                    <p>${item.text}</p>
                </div>`).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <div class="ask-grid">${cards}</div>
            </div>`;
        }

        static _timeline(d) {
            const colorMap = { accent: 'var(--accent)', gold: 'var(--gold)', success: 'var(--success)' };
            const nodes = d.nodes.map((node, i) => `
                <div class="timeline-node${i === 0 ? ' active' : ''}" onclick="activateTimelineNode(${node.id})">
                    <div class="timeline-dot">${node.id}</div>
                    <div class="timeline-detail">
                        <h4 style="color:${colorMap[node.color] || 'white'}">${node.title}</h4>
                        <p>${node.text}</p>
                        <p class="timeline-executor"><i class="fas fa-users-cog"></i> ${node.executor}</p>
                    </div>
                </div>`).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <p class="anim" style="--anim-order:1">${d.description}</p>
                <div class="timeline-interactive anim" style="--anim-order:2">
                    <div class="timeline-track" id="timelineTrack">${nodes}</div>
                </div>
            </div>`;
        }

        static _risks(d) {
            const colorClass = { red: 'flip-card--red', yellow: 'flip-card--yellow', green: 'flip-card--green' };
            const cards = d.items.map((item, i) => `
                <div class="flip-card ${colorClass[item.color] || ''} anim" style="--anim-order:${i + 1}" onclick="flipCard(this)">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <i class="${item.icon}"></i>
                            <h3>${item.front.title}</h3>
                            <p>${item.front.text}</p>
                            <span class="flip-hint"><i class="fas fa-sync-alt"></i> اضغط لرؤية الحل</span>
                        </div>
                        <div class="flip-card-back">
                            <i class="fas fa-check-circle"></i>
                            <h3>${item.back.title}</h3>
                            <p>${item.back.text}</p>
                        </div>
                    </div>
                </div>`).join('');
            return `
            <div class="content-card">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <div class="flip-grid">${cards}</div>
                <p class="flip-instruction anim" style="--anim-order:${d.items.length + 1}">
                    <i class="fas fa-hand-pointer"></i> اضغط على أي بطاقة لرؤية خطة الاستجابة
                </p>
            </div>`;
        }

        static _conclusion(d) {
            const points = d.items.map((item, i) => `
                <div class="conclusion-point anim" style="--anim-order:${i + 1}">
                    <i class="${item.icon}" style="color:var(--${item.color});"></i>
                    <h3>${item.title}</h3><p>${item.text}</p>
                </div>`).join('');
            return `
            <div class="content-card text-center">
                <h2 class="anim" style="--anim-order:0">${d.title}</h2>
                <div class="conclusion-grid">${points}</div>
                <div class="conclusion-motto anim" style="--anim-order:${d.items.length + 1}">${d.motto}</div>
                <p class="anim" style="--anim-order:${d.items.length + 2}">${d.footer}</p>
            </div>`;
        }

        static _closing(d) {
            return `
            <div class="content-card text-center">
                <h1 class="gradient-text anim" style="--anim-order:0;font-size:3rem;margin-bottom:2rem;">${d.title}</h1>
                <p class="anim" style="--anim-order:1;font-size:1.2rem;">${d.subtitle}</p>
                <div class="qr-core anim" style="--anim-order:2">QR</div>
                <p class="anim" style="--anim-order:3">${d.qrText}</p>
            </div>`;
        }
    }

    // ── Particle System ──
    class ParticleSystem {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.init();
            this.animate();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        init() {
            const count = Math.min(60, Math.floor(window.innerWidth / 25));
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    radius: Math.random() * 1.8 + 0.5,
                    opacity: Math.random() * 0.4 + 0.08,
                    color: Math.random() > 0.7 ? '245, 158, 11' : '59, 130, 246'
                });
            }
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
                this.ctx.fill();
            });

            // Draw connection lines between nearby particles
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        this.ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * (1 - dist / 110)})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    // ── Show Impact Modal ──
    // Data is sourced from window.impactData defined in content.js
    window.showImpact = function (role) {
        const data = (window.impactData || {})[role];
        if (!data) return;
        document.getElementById('impactTitle').innerText = data.title;
        document.getElementById('impactPain').innerHTML = data.pain.map(i => `<li>${i}</li>`).join('');
        document.getElementById('impactCauses').innerHTML = data.causes.map(i => `<li>${i}</li>`).join('');
        document.getElementById('impactSolutions').innerHTML = data.solutions.map(i => `<li>${i}</li>`).join('');
        document.getElementById('impactOverlay').classList.add('active');
    };

    document.getElementById('closeImpact')?.addEventListener('click', () => {
        document.getElementById('impactOverlay').classList.remove('active');
    });

    // ── QR Scan Simulation ──
    window.simulateScan = function (el) {
        el.classList.add('scanning');
        setTimeout(() => {
            el.classList.remove('scanning');
            el.style.borderColor = 'var(--success)';
            const icon = el.querySelector('i');
            const oldClass = icon.className;
            icon.className = 'fas fa-check-circle';
            icon.style.color = 'var(--success)';
            setTimeout(() => {
                icon.className = oldClass;
                icon.style.color = '';
                el.style.borderColor = 'transparent';
            }, 1500);
        }, 2000);
    };

    // ── Tech Box Interaction ──
    window.techBounce = function (el) {
        el.style.transform = 'scale(1.05) translateY(-10px)';
        setTimeout(() => el.style.transform = '', 400);
    };

    // ── Timeline Interaction ──
    window.activateTimelineNode = function (index) {
        const nodes = document.querySelectorAll('.timeline-node');
        const track = document.querySelector('.timeline-track');

        nodes.forEach((n, i) => {
            n.classList.toggle('active', i < index);
        });

        if (track) {
            track.className = 'timeline-track step-' + index;
        }
    };

    // ── Flip Card ──
    window.flipCard = function (el) {
        el.classList.toggle('flipped');
    };

    // ── Slide Navigation ──
    function updateSlide() {
        const slides = document.querySelectorAll('.slide');
        slides.forEach((s, i) => {
            s.classList.remove('active');
            // Reset animations for re-entrance
            const animItems = s.querySelectorAll('.anim');
            animItems.forEach(item => {
                item.style.animation = 'none';
                item.offsetHeight; // Force reflow
                item.style.animation = '';
            });
        });

        const activeSlide = slides[currentSlide - 1];
        if (activeSlide) {
            activeSlide.classList.add('active');

            // Update Speaker Notes
            const noteData = activeSlide.querySelector('.speaker-note-data');
            if (notesContent) {
                notesContent.innerHTML = noteData
                    ? noteData.textContent
                    : 'لا توجد ملاحظات لهذه الشريحة.';
            }
        }

        // Update progress bar
        if (progressBar) {
            const progress = (currentSlide / TOTAL_SLIDES) * 100;
            progressBar.style.width = progress + '%';
        }

        // Update slide counter
        if (slideCounter) {
            slideCounter.textContent = `${currentSlide} / ${TOTAL_SLIDES}`;
        }
    }

    window.nextSlide = function () {
        if (currentSlide < TOTAL_SLIDES) {
            currentSlide++;
            updateSlide();
        }
    };

    window.prevSlide = function () {
        if (currentSlide > 1) {
            currentSlide--;
            updateSlide();
        }
    };

    // ── Speaker Notes Toggle ──
    function toggleNotes() {
        notesVisible = !notesVisible;
        if (notesPanel) {
            notesPanel.classList.toggle('visible', notesVisible);
        }
    }

    notesToggle?.addEventListener('click', toggleNotes);

    // ── Fullscreen Toggle ──
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    function handleToggleFullscreen() {
        console.log("Fullscreen toggle triggered");
        const doc = document.documentElement;
        const isFull = document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement;

        if (!isFull) {
            const request = doc.requestFullscreen ||
                doc.webkitRequestFullscreen ||
                doc.mozRequestFullScreen ||
                doc.msRequestFullscreen;
            if (request) {
                request.call(doc)
                    .then(() => {
                        console.log("Fullscreen enabled");
                        if (fullscreenBtn) fullscreenBtn.querySelector('i').className = 'fas fa-compress';
                    })
                    .catch(err => {
                        console.error(`Fullscreen request failed: ${err.message} (${err.name})`);
                        if (err.name === 'NotAllowedError') {
                            alert("Chrome blocked fullscreen. Please click the button directly instead of using the keyboard if it fails.");
                        }
                    });
            } else {
                alert("Fullscreen API is not supported in this browser.");
            }
        } else {
            const exit = document.exitFullscreen ||
                document.webkitExitFullscreen ||
                document.mozCancelFullScreen ||
                document.msExitFullscreen;
            if (exit) {
                exit.call(document)
                    .then(() => {
                        if (fullscreenBtn) fullscreenBtn.querySelector('i').className = 'fas fa-expand';
                    })
                    .catch(() => { });
            }
        }
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', handleToggleFullscreen);
    }

    // Handle ESC key or manual exit to update icon
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && fullscreenBtn) {
            fullscreenBtn.querySelector('i').className = 'fas fa-expand';
        }
    });
    document.addEventListener('webkitfullscreenchange', () => {
        if (!document.webkitFullscreenElement && fullscreenBtn) {
            fullscreenBtn.querySelector('i').className = 'fas fa-expand';
        }
    });

    // ── Keyboard Navigation ──
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prevSlide();
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            nextSlide();
        }
        if (e.key.toLowerCase() === 'n') toggleNotes();
        if (e.key.toLowerCase() === 'f') {
            e.preventDefault();
            handleToggleFullscreen();
        }
        if (e.key === 'Escape') {
            document.getElementById('impactOverlay')?.classList.remove('active');
        }
    });

    // ── Touch / Swipe Support ──
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Only trigger if horizontal swipe is dominant
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
            // RTL: swipe left = next, swipe right = prev
            if (diffX > 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });

    // ── Wire Navigation Buttons (by ID, not inline onclick) ──
    document.getElementById('prevBtn')?.addEventListener('click', prevSlide);
    document.getElementById('nextBtn')?.addEventListener('click', nextSlide);

    // ── Initialize ──
    // 1. Render all slides from content.js into #slidesContainer
    SlideRenderer.renderAll(window.slidesData, slidesContainer);

    // 2. Wire QR click after render (element now exists in DOM)
    document.querySelector('.qr-core')?.addEventListener('click', function () {
        this.innerHTML = '<i class="fas fa-check-circle" style="color:var(--success);"></i>';
        setTimeout(() => { this.innerHTML = 'QR'; }, 2000);
    });

    // 3. Start particle system and show first slide
    new ParticleSystem('particleCanvas');
    updateSlide();
});
