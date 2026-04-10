/* ============================================
   Bus App Presentation - Interactive Engine
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ── Configuration ──
    const TOTAL_SLIDES = 16;
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

    // ── Impact Modal Data ──
    const roleData = {
        citizen: {
            title: 'أثر المنظومة على المواطن',
            pain: [
                'وقت انتظار طويل وغير محدد في مراكز الانطلاق',
                'عشوائية في الأسعار واستغلال من السماسرة',
                'انعدام الراحة والأمان في بيئة الكراج',
                'عدم معرفة مواعيد الرحلات والمقاعد المتاحة مسبقاً'
            ],
            causes: [
                'الازدحام والتدافع العشوائي اليومي',
                'غياب نظام حجز مسبق ومنظم',
                'الاستغلال المادي من وسطاء غير مرخصين'
            ],
            solutions: [
                'حجز فوري من المنزل عبر التطبيق',
                'أسعار رسمية ثابتة وشفافة لجميع الخطوط',
                'معرفة دقيقة بمواعيد الانطلاق والمقاعد المتاحة',
                'تذكرة رقمية موثقة بـ QR تحفظ حقوق المسافر'
            ]
        },
        company: {
            title: 'أثر المنظومة على شركات النقل',
            pain: [
                'تسرب مالي من ظاهرة \"الجباية\" اليدوية غير المراقبة',
                'غياب بيانات إحصائية دقيقة عن الرحلات والركاب',
                'صعوبة تتبع أداء السائقين والالتزام بالجداول',
                'إدارة ورقية مرهقة وعرضة للأخطاء'
            ],
            causes: [
                'خسائر مالية مستمرة وصعوبة التدقيق',
                'عدم القدرة على التخطيط للتوسع بناءً على بيانات',
                'ضعف الثقة بين الإدارة والعاملين في الميدان'
            ],
            solutions: [
                'تتبع مالي لحظي وإيرادات موثقة إلكترونياً',
                'تقارير أداء ذكية لرفع الكفاءة التشغيلية',
                'إدارة متكاملة للحافلات والسائقين والمسارات',
                'مانيفست رقمي آلي يلغي الحاجة للتوثيق الورقي'
            ]
        },
        state: {
            title: 'أثر المنظومة على وزارة النقل (الدولة)',
            pain: [
                'غياب شبه كامل للبيانات عن حركة النقل البري',
                'صعوبة الرقابة الفعلية على التزام الشركات',
                'تسرب موارد ضريبية بسبب التعاملات النقدية غير الموثقة',
                'عدم القدرة على التخطيط الاستراتيجي لقطاع النقل'
            ],
            causes: [
                'استحالة إجراء تحليلات أو اتخاذ قرارات مبنية على بيانات',
                'استياء المواطنين من جودة الخدمات العامة للنقل',
                'ضعف الهيبة التنظيمية للوزارة في قطاع البولمان'
            ],
            solutions: [
                'أرشيف وطني رقمي موحد لحركة النقل والركاب',
                'رقابة مركزية لحظية على جميع الخطوط والشركات',
                'الحد الجذري من التسرب الضريبي عبر الأتمتة الكاملة',
                'قرارات تخطيطية مبنية على حقائق وبيانات حقيقية'
            ]
        }
    };

    // ── Show Impact Modal ──
    window.showImpact = function (role) {
        const data = roleData[role];
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
    window.toggleFullscreen = function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen();
        }
    };

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
        if (e.key.toLowerCase() === 'f') toggleFullscreen();
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

    // ── QR Core Click ──
    const qrCore = document.querySelector('.qr-core');
    if (qrCore) {
        qrCore.addEventListener('click', function () {
            this.innerHTML = '<i class="fas fa-check-circle" style="color: var(--success);"></i>';
            setTimeout(() => { this.innerHTML = 'QR'; }, 2000);
        });
    }

    // ── Initialize ──
    new ParticleSystem('particleCanvas');
    updateSlide();
});
