// Function to change the background color of the body when the button is clicked
document.getElementById("changeColorButton").addEventListener("click", function() {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F4F4F4", "#FFC300"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
    
        // Initialize Mermaid with custom configuration
        mermaid.initialize({ 
            startOnLoad: true, 
            theme: 'base',
            themeVariables: {
                primaryColor: '#ecfdf5',
                primaryTextColor: '#047857',
                primaryBorderColor: '#047857',
                lineColor: '#6b7280',
                secondaryColor: '#fffbeb',
                tertiaryColor: '#f8fafc',
                background: '#ffffff',
                mainBkg: '#ffffff',
                secondaryBkg: '#f8fafc',
                tertiaryBkg: '#f1f5f9',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px'
            },
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
                curve: 'basis',
                padding: 20
            }
        });

        // Initialize Mermaid Controls for zoom and pan
        function initializeMermaidControls() {
            const containers = document.querySelectorAll('.mermaid-container');

            containers.forEach(container => {
            const mermaidElement = container.querySelector('.mermaid');
            let scale = 1;
            let isDragging = false;
            let startX, startY, translateX = 0, translateY = 0;

            // 触摸相关状态
            let isTouch = false;
            let touchStartTime = 0;
            let initialDistance = 0;
            let initialScale = 1;
            let isPinching = false;

            // Zoom controls
            const zoomInBtn = container.querySelector('.zoom-in');
            const zoomOutBtn = container.querySelector('.zoom-out');
            const resetBtn = container.querySelector('.reset-zoom');
            const fullscreenBtn = container.querySelector('.fullscreen');

            function updateTransform() {
                mermaidElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;

                if (scale > 1) {
                container.classList.add('zoomed');
                } else {
                container.classList.remove('zoomed');
                }

                mermaidElement.style.cursor = isDragging ? 'grabbing' : 'grab';
            }

            if (zoomInBtn) {
                zoomInBtn.addEventListener('click', () => {
                scale = Math.min(scale * 1.25, 4);
                updateTransform();
                });
            }

            if (zoomOutBtn) {
                zoomOutBtn.addEventListener('click', () => {
                scale = Math.max(scale / 1.25, 0.3);
                if (scale <= 1) {
                    translateX = 0;
                    translateY = 0;
                }
                updateTransform();
                });
            }

            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                scale = 1;
                translateX = 0;
                translateY = 0;
                updateTransform();
                });
            }

            if (fullscreenBtn) {
                fullscreenBtn.addEventListener('click', () => {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                }
                });
            }

            // Mouse Events
            mermaidElement.addEventListener('mousedown', (e) => {
                if (isTouch) return; // 如果是触摸设备，忽略鼠标事件

                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                mermaidElement.style.cursor = 'grabbing';
                updateTransform();
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging && !isTouch) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                updateTransform();
                }
            });

            document.addEventListener('mouseup', () => {
                if (isDragging && !isTouch) {
                isDragging = false;
                mermaidElement.style.cursor = 'grab';
                updateTransform();
                }
            });

            document.addEventListener('mouseleave', () => {
                if (isDragging && !isTouch) {
                isDragging = false;
                mermaidElement.style.cursor = 'grab';
                updateTransform();
                }
            });

            // 获取两点之间的距离
            function getTouchDistance(touch1, touch2) {
                return Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
                );
            }

            // Touch Events - 触摸事件处理
            mermaidElement.addEventListener('touchstart', (e) => {
                isTouch = true;
                touchStartTime = Date.now();

                if (e.touches.length === 1) {
                // 单指拖动
                isPinching = false;
                isDragging = true;

                const touch = e.touches[0];
                startX = touch.clientX - translateX;
                startY = touch.clientY - translateY;

                } else if (e.touches.length === 2) {
                // 双指缩放
                isPinching = true;
                isDragging = false;

                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = getTouchDistance(touch1, touch2);
                initialScale = scale;
                }

                e.preventDefault();
            }, { passive: false });

            mermaidElement.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1 && isDragging && !isPinching) {
                // 单指拖动
                const touch = e.touches[0];
                translateX = touch.clientX - startX;
                translateY = touch.clientY - startY;
                updateTransform();

                } else if (e.touches.length === 2 && isPinching) {
                // 双指缩放
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = getTouchDistance(touch1, touch2);

                if (initialDistance > 0) {
                    const newScale = Math.min(Math.max(
                    initialScale * (currentDistance / initialDistance),
                    0.3
                    ), 4);
                    scale = newScale;
                    updateTransform();
                }
                }

                e.preventDefault();
            }, { passive: false });

            mermaidElement.addEventListener('touchend', (e) => {
                // 重置状态
                if (e.touches.length === 0) {
                isDragging = false;
                isPinching = false;
                initialDistance = 0;

                // 延迟重置isTouch，避免鼠标事件立即触发
                setTimeout(() => {
                    isTouch = false;
                }, 100);
                } else if (e.touches.length === 1 && isPinching) {
                // 从双指变为单指，切换为拖动模式
                isPinching = false;
                isDragging = true;

                const touch = e.touches[0];
                startX = touch.clientX - translateX;
                startY = touch.clientY - translateY;
                }

                updateTransform();
            });

            mermaidElement.addEventListener('touchcancel', (e) => {
                isDragging = false;
                isPinching = false;
                initialDistance = 0;

                setTimeout(() => {
                isTouch = false;
                }, 100);

                updateTransform();
            });

            // Enhanced wheel zoom with better center point handling
            container.addEventListener('wheel', (e) => {
                e.preventDefault();
                const rect = container.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                const newScale = Math.min(Math.max(scale * delta, 0.3), 4);

                // Adjust translation to zoom towards center
                if (newScale !== scale) {
                const scaleDiff = newScale / scale;
                translateX = translateX * scaleDiff;
                translateY = translateY * scaleDiff;
                scale = newScale;

                if (scale <= 1) {
                    translateX = 0;
                    translateY = 0;
                }

                updateTransform();
                }
            });

            // Initialize display
            updateTransform();
            });
        }

        // Initialize Mermaid with custom configuration
        mermaid.initialize({ 
            startOnLoad: true, 
            theme: 'base',
            themeVariables: {
                primaryColor: '#ecfdf5',
                primaryTextColor: '#047857',
                primaryBorderColor: '#047857',
                lineColor: '#6b7280',
                secondaryColor: '#fffbeb',
                tertiaryColor: '#f8fafc',
                background: '#ffffff',
                mainBkg: '#ffffff',
                secondaryBkg: '#f8fafc',
                tertiaryBkg: '#f1f5f9',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px'
            },
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
                curve: 'basis',
                padding: 20
            }
        });

        // Initialize controls after mermaid renders
        setTimeout(initializeMermaidControls, 1000);

        // Table of Contents functionality
        const tocLinks = document.querySelectorAll('.toc-link');
        const sections = document.querySelectorAll('section[id]');
        const progressBar = document.getElementById('progress-bar');
        
        // Smooth scrolling for TOC links
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Update active TOC link based on scroll position
        function updateActiveTocLink() {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
            
            // Update progress bar
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollTop = window.scrollY;
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = progress + '%';
        }
        
        // Throttled scroll event listener
        let ticking = false;
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateActiveTocLink();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', onScroll);
        
        // Mobile TOC toggle (for responsive design)
        const tocToggle = document.createElement('button');
        tocToggle.innerHTML = '<i class="fas fa-bars"></i>';
        tocToggle.className = 'fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg md:hidden';
        tocToggle.addEventListener('click', () => {
            document.querySelector('.toc-fixed').classList.toggle('open');
        });
        document.body.appendChild(tocToggle);
        
        // Close TOC when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const toc = document.querySelector('.toc-fixed');
            if (window.innerWidth <= 768 && toc.classList.contains('open') && 
                !toc.contains(e.target) && e.target !== tocToggle) {
                toc.classList.remove('open');
            }
        });
        
        // Initialize on load
        updateActiveTocLink();
        
        // Add fade-in animation for strategy cards
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.strategy-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
    
});
