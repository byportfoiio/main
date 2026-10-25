(() => {

    "use strict";

    /* =====================================================
       MOSCOW CLOCK
    ====================================================== */

    const moscowTime =
        document.getElementById(
            "moscow-time"
        );


    function updateMoscowTime() {

        if (!moscowTime) {
            return;
        }


        const now =
            new Date();


        const formatter =
            new Intl.DateTimeFormat(
                "ru-RU",
                {
                    timeZone:
                        "Europe/Moscow",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit",

                    hour12:
                        false
                }
            );


        moscowTime.textContent =
            formatter.format(now);

    }


    updateMoscowTime();


    window.setInterval(
        updateMoscowTime,
        1000
    );


    /* =====================================================
       SLIDER CREATOR
    ====================================================== */

    function createSlider({
        trackSelector,
        controlsSelector,
        counterSelector
    }) {

        const track =
            document.querySelector(
                trackSelector
            );


        const controls =
            document.querySelector(
                controlsSelector
            );


        const counter =
            document.querySelector(
                counterSelector
            );


        if (
            !track ||
            !controls
        ) {

            return null;

        }


        const viewport =
            track.parentElement;


        const pages =
            Array.from(
                track.children
            );


        if (
            pages.length === 0
        ) {

            return null;

        }


        const previousButton =
            controls.querySelector(
                '[data-action="prev"]'
            );


        const nextButton =
            controls.querySelector(
                '[data-action="next"]'
            );


        const dots =
            Array.from(
                controls.querySelectorAll(
                    ".slider-dot"
                )
            );


        let currentIndex =
            0;


        /* =================================================
           UPDATE UI
        ================================================== */

        function updateUI() {

            const total =
                pages.length;


            track.style.transform =
                `translate3d(
                    -${currentIndex * 100}%,
                    0,
                    0
                )`;


            pages.forEach(
                (
                    page,
                    index
                ) => {

                    page.classList.toggle(
                        "is-active",
                        index === currentIndex
                    );

                }
            );


            dots.forEach(
                (
                    dot,
                    index
                ) => {

                    const active =
                        index ===
                        currentIndex;


                    dot.classList.toggle(
                        "active",
                        active
                    );


                    dot.setAttribute(
                        "aria-selected",
                        String(active)
                    );

                }
            );


            if (counter) {

                counter.textContent =
                    `PAGE ${
                        currentIndex + 1
                    }/${total}`;

            }


            if (previousButton) {

                previousButton.disabled =
                    currentIndex === 0;

            }


            if (nextButton) {

                nextButton.disabled =
                    currentIndex ===
                    total - 1;

            }

        }


        /* =================================================
           GO TO
        ================================================== */

        function goTo(index) {

            currentIndex =
                Math.max(
                    0,
                    Math.min(
                        index,
                        pages.length - 1
                    )
                );


            updateUI();

        }


        /* =================================================
           BUTTONS
        ================================================== */

        previousButton?.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                if (
                    currentIndex <= 0
                ) {

                    return;

                }


                goTo(
                    currentIndex - 1
                );

            }
        );


        nextButton?.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                if (
                    currentIndex >=
                    pages.length - 1
                ) {

                    return;

                }


                goTo(
                    currentIndex + 1
                );

            }
        );


        /* =================================================
           DOTS
        ================================================== */

        dots.forEach(
            (dot) => {

                dot.addEventListener(
                    "click",
                    (event) => {

                        event.stopPropagation();


                        const index =
                            Number(
                                dot.dataset.index
                            );


                        if (
                            Number.isNaN(index)
                        ) {

                            return;

                        }


                        goTo(index);

                    }
                );

            }
        );


        /* =================================================
           POINTER DRAG
           PC + TOUCH
        ================================================== */

        let pointerStartX =
            0;

        let pointerStartY =
            0;

        let pointerActive =
            false;

        let pointerDragged =
            false;


        viewport?.addEventListener(
            "pointerdown",
            (event) => {

                /*
                 * Только левая кнопка мыши.
                 */

                if (
                    event.pointerType ===
                    "mouse" &&
                    event.button !== 0
                ) {

                    return;

                }


                /*
                 * Не начинаем drag на стрелке
                 * или точке.
                 */

                if (
                    event.target.closest(
                        ".slider-arrow, .slider-dot"
                    )
                ) {

                    return;

                }


                pointerStartX =
                    event.clientX;


                pointerStartY =
                    event.clientY;


                pointerActive =
                    true;


                pointerDragged =
                    false;


                viewport.setPointerCapture?.(
                    event.pointerId
                );


                viewport.classList.add(
                    "is-dragging"
                );

            }
        );


        viewport?.addEventListener(
            "pointermove",
            (event) => {

                if (
                    !pointerActive
                ) {

                    return;

                }


                const deltaX =
                    event.clientX -
                    pointerStartX;


                const deltaY =
                    event.clientY -
                    pointerStartY;


                /*
                 * Считаем drag горизонтальным
                 * только когда X больше Y.
                 */

                if (
                    !pointerDragged &&
                    Math.abs(deltaX) > 10 &&
                    Math.abs(deltaX) >
                    Math.abs(deltaY)
                ) {

                    pointerDragged =
                        true;

                }


                if (
                    pointerDragged
                ) {

                    event.preventDefault();

                }

            },
            {
                passive:
                    false
            }
        );


        function finishPointer(event) {

            if (
                !pointerActive
            ) {

                return;

            }


            pointerActive =
                false;


            viewport.classList.remove(
                "is-dragging"
            );


            const deltaX =
                event.clientX -
                pointerStartX;


            const deltaY =
                event.clientY -
                pointerStartY;


            const horizontal =
                Math.abs(deltaX) >
                Math.abs(deltaY);


            const enough =
                Math.abs(deltaX) >= 55;


            if (
                horizontal &&
                enough
            ) {

                /*
                 * LEFT = NEXT
                 * RIGHT = PREVIOUS
                 */

                if (
                    deltaX < 0
                ) {

                    goTo(
                        currentIndex + 1
                    );

                } else {

                    goTo(
                        currentIndex - 1
                    );

                }

            }


            try {

                viewport.releasePointerCapture?.(
                    event.pointerId
                );

            } catch {

                /* Nothing */

            }

        }


        viewport?.addEventListener(
            "pointerup",
            finishPointer
        );


        viewport?.addEventListener(
            "pointercancel",
            finishPointer
        );


        viewport?.addEventListener(
            "lostpointercapture",
            () => {

                pointerActive =
                    false;


                viewport.classList.remove(
                    "is-dragging"
                );

            }
        );


        viewport?.addEventListener(
            "dragstart",
            (event) => {

                event.preventDefault();

            }
        );


        /* =================================================
           INITIAL RENDER
        ================================================== */

        updateUI();


        return {

            next() {

                goTo(
                    currentIndex + 1
                );

            },

            previous() {

                goTo(
                    currentIndex - 1
                );

            }

        };

    }


    /* =====================================================
       INITIALIZE SLIDERS
    ====================================================== */

    const aboutSlider =
        createSlider({

            trackSelector:
                ".about-track",

            controlsSelector:
                '[data-slider-controls="about"]',

            counterSelector:
                ".about-counter"

        });


    createSlider({

        trackSelector:
            ".devices-track",

        controlsSelector:
            '[data-slider-controls="devices"]',

        counterSelector:
            ".devices-counter"

    });


    createSlider({

        trackSelector:
            ".contact-track",

        controlsSelector:
            '[data-slider-controls="contact"]',

        counterSelector:
            ".contact-counter"

    });


    /* =====================================================
       KEYBOARD
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            const tagName =
                document.activeElement?.tagName;


            const isTyping =
                tagName === "INPUT" ||
                tagName === "TEXTAREA" ||
                tagName === "SELECT";


            if (
                isTyping
            ) {

                return;

            }


            if (
                event.key ===
                "ArrowLeft"
            ) {

                event.preventDefault();

                aboutSlider?.previous();

            }


            if (
                event.key ===
                "ArrowRight"
            ) {

                event.preventDefault();

                aboutSlider?.next();

            }

        }
    );


    /* =====================================================
       MAIN SECTION NAVIGATION
    ====================================================== */

    const sections =
        Array.from(
            document.querySelectorAll(
                ".section"
            )
        );


    const sectionDots =
        Array.from(
            document.querySelectorAll(
                ".section-nav-dot"
            )
        );


    const sectionBars =
        Array.from(
            document.querySelectorAll(
                ".section-progress-bar"
            )
        );


    function setActiveSection(index) {

        sectionDots.forEach(
            (
                dot,
                dotIndex
            ) => {

                dot.classList.toggle(
                    "active",
                    dotIndex === index
                );

            }
        );


        sectionBars.forEach(
            (
                bar,
                barIndex
            ) => {

                bar.classList.toggle(
                    "active",
                    barIndex === index
                );

            }
        );

    }


    /* =====================================================
       DESKTOP SIDE DOTS
    ====================================================== */

    sectionDots.forEach(
        (
            dot,
            index
        ) => {

            dot.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();


                    const target =
                        sections[index];


                    if (
                        !target
                    ) {

                        return;

                    }


                    target.scrollIntoView({
                        behavior:
                            "smooth",

                        block:
                            "start"
                    });


                    setActiveSection(
                        index
                    );

                }
            );

        }
    );


    /* =====================================================
       TOP RIGHT BARS
    ====================================================== */

    sectionBars.forEach(
        (
            bar,
            index
        ) => {

            bar.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();


                    const target =
                        sections[index];


                    if (
                        !target
                    ) {

                        return;

                    }


                    target.scrollIntoView({
                        behavior:
                            "smooth",

                        block:
                            "start"
                    });


                    setActiveSection(
                        index
                    );

                }
            );

        }
    );


    /* =====================================================
       SECTION OBSERVER
    ====================================================== */

    if (
        "IntersectionObserver"
        in window
    ) {

        const observer =
            new IntersectionObserver(

                (entries) => {

                    let strongest =
                        null;


                    entries.forEach(
                        (entry) => {

                            if (
                                !entry.isIntersecting
                            ) {

                                return;

                            }


                            /*
                             * Включаем появление
                             * секции.
                             */

                            entry.target.classList.add(
                                "section-visible"
                            );


                            if (
                                !strongest ||
                                entry.intersectionRatio >
                                strongest.intersectionRatio
                            ) {

                                strongest =
                                    entry;

                            }

                        }
                    );


                    if (
                        !strongest
                    ) {

                        return;

                    }


                    const index =
                        sections.indexOf(
                            strongest.target
                        );


                    if (
                        index !== -1
                    ) {

                        setActiveSection(
                            index
                        );

                    }

                },

                {
                    threshold: [
                        0.35,
                        0.55,
                        0.70
                    ]

                }

            );


        sections.forEach(
            (section) => {

                observer.observe(
                    section
                );

            }
        );

    }


    /* =====================================================
       INITIAL SECTION
    ====================================================== */

    sections[0]?.classList.add(
        "section-visible"
    );


    setActiveSection(0);


    /* =====================================================
       HASH NAVIGATION
    ====================================================== */

    window.addEventListener(
        "load",
        () => {

            const hash =
                window.location.hash;


            if (
                !hash
            ) {

                return;

            }


            const target =
                document.querySelector(
                    hash
                );


            if (
                !target
            ) {

                return;

            }


            window.setTimeout(
                () => {

                    target.scrollIntoView({
                        behavior:
                            "smooth",

                        block:
                            "start"
                    });

                },
                120
            );

        }
    );


    /* =====================================================
       AVATAR PROTECTION
    ====================================================== */

    const avatar =
        document.querySelector(
            ".avatar-image"
        );


    if (avatar) {

        avatar.addEventListener(
            "error",
            () => {

                avatar.style.visibility =
                    "hidden";

            }
        );

    }


})();