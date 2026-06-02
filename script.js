// ========== CONFIGURAÇÃO ==========
const POSTERS = [
    { name: 'Beatriz Bernardo', email: 'Beatriz.Bernardo@br.nestle.com' },
    { name: 'Carlos Bastos', email: 'Carlos.Bastos@br.nestle.com' },
    { name: 'Daniel Oliveira', email: 'Daniel.Oliveira@br.nestle.com' },
    { name: 'Lucas Nascimento', email: 'Lucas.Nascimento1@br.nestle.com' },
    { name: 'Renata Raposo', email: 'Renata.Raposo@br.nestle.com' }
];

// Data de referência: 28/05/2026 (sexta-feira) - Beatriz é a primeira
const REFERENCE_DATE = new Date(2026, 4, 28); // Mês é 0-indexed (4 = maio)

// ========== CÁLCULO DO POSTADOR DA SEMANA ==========
function getWeekIndex() {
    // Usa a sexta-feira da semana atual para manter consistência com o calendário
    return getPosterIndexForDate(getCurrentFriday());
}

function getCurrentFriday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + (daysUntilFriday === 0 && today.getHours() < 18 ? 0 : daysUntilFriday));
    return friday;
}

function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// ========== RENDERIZAÇÃO ==========
function renderPoster() {
    const weekIndex = getWeekIndex();
    const currentPoster = POSTERS[weekIndex];
    
    // Atualizar info principal
    document.getElementById('poster-name').textContent = currentPoster.name;
    document.getElementById('poster-email').textContent = currentPoster.email;

    // Foto via SharePoint
    const photoUrl = 'https://nestle.sharepoint.com/sites/ournest-hq/_layouts/15/userphoto.aspx?size=L&username=' + currentPoster.email;
    const photoEl = document.getElementById('poster-photo');
    photoEl.src = photoUrl;
    photoEl.alt = currentPoster.name;
    photoEl.onerror = function() {
        photoEl.style.display = 'none';
        var avatarEl = document.getElementById('poster-avatar');
        avatarEl.classList.add('fallback');
        avatarEl.setAttribute('data-initials', getInitials(currentPoster.name));
    };
    
    const friday = getCurrentFriday();
    document.getElementById('poster-date').textContent = formatDate(friday);
    
    // Renderizar lista de rotação
    const listEl = document.getElementById('rotation-list');
    listEl.innerHTML = '';
    
    for (let i = 0; i < POSTERS.length; i++) {
        const poster = POSTERS[i];
        const li = document.createElement('li');
        
        if (i === weekIndex) {
            li.classList.add('active');
        }
        
        // Calcular a sexta-feira correspondente a cada pessoa da fila
        const weeksFromRef = getWeeksFromRefForIndex(i, weekIndex);
        const friday = getCurrentFriday();
        const posterFriday = new Date(friday);
        posterFriday.setDate(friday.getDate() + weeksFromRef * 7);
        
        // Tooltip com a data para quem NÃO é o atual
        if (i !== weekIndex) {
            const tooltipDate = posterFriday.toLocaleDateString('pt-BR', {
                weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
            });
            li.title = `Semana de ${tooltipDate}`;
        }
        
        const listPhotoUrl = 'https://nestle.sharepoint.com/sites/ournest-hq/_layouts/15/userphoto.aspx?size=S&username=' + poster.email;
        li.innerHTML = `
            <img class="list-photo" src="${listPhotoUrl}" alt="${poster.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <span class="list-initials">${getInitials(poster.name)}</span>
            <span>${poster.name}</span>
            <span class="week-label">${i === weekIndex ? '← Esta semana' : ''}</span>
        `;
        
        listEl.appendChild(li);
    }
}

function getWeeksFromRefForIndex(targetIndex, currentIndex) {
    const diff = targetIndex - currentIndex;
    return diff >= 0 ? diff : diff + POSTERS.length;
}

// ========== COPIAR PROMPT ==========
function setupCopyButton() {
    const btn = document.getElementById('btn-copy-prompt');
    const promptContent = document.getElementById('prompt-content');
    
    btn.addEventListener('click', function() {
        const text = promptContent.textContent;
        
        navigator.clipboard.writeText(text).then(function() {
            btn.classList.add('copied');
            btn.querySelector('.copy-text').textContent = 'Copiado!';
            btn.querySelector('.copy-icon').textContent = '✓';
            
            setTimeout(function() {
                btn.classList.remove('copied');
                btn.querySelector('.copy-text').textContent = 'Copiar';
                btn.querySelector('.copy-icon').textContent = '📋';
            }, 2000);
        });
    });
}

// ========== SCROLL ANIMATIONS ==========
function setupScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15
    });
    
    sections.forEach(function(section) {
        observer.observe(section);
    });
}

// ========== MINI CALENDAR ==========
let calYear, calMonth;

function getPosterIndexForDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const ref = new Date(REFERENCE_DATE);
    ref.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((d - ref) / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    return ((diffWeeks % POSTERS.length) + POSTERS.length) % POSTERS.length;
}

function renderCalendar() {
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    document.getElementById('cal-title').textContent = monthNames[calMonth] + ' ' + calYear;

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date();

    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'cal-cell';
        grid.appendChild(cell);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(calYear, calMonth, d);
        const cell = document.createElement('div');
        cell.className = 'cal-cell';

        if (date.toDateString() === today.toDateString()) {
            cell.classList.add('today');
        }

        if (date.getDay() === 5) { // sexta-feira
            const posterIdx = getPosterIndexForDate(date);
            const poster = POSTERS[posterIdx];
            const dd = String(d).padStart(2, '0');
            const mm = String(calMonth + 1).padStart(2, '0');
            cell.classList.add('friday-poster');
            cell.title = poster.name + ' — ' + dd + '/' + mm;
            const photoUrl = 'https://nestle.sharepoint.com/sites/ournest-hq/_layouts/15/userphoto.aspx?size=S&username=' + poster.email;
            const initials = getInitials(poster.name);
            cell.innerHTML =
                '<div class="cal-avatar">' +
                '<img src="' + photoUrl + '" alt="' + poster.name + '" ' +
                'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
                '<span class="cal-initials-sm" style="display:none">' + initials + '</span>' +
                '</div>';
        } else {
            cell.textContent = d;
        }

        grid.appendChild(cell);
    }
}

function initCalendar() {
    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
    renderCalendar();

    document.getElementById('cal-prev').addEventListener('click', function() {
        calMonth--;
        if (calMonth < 0) { calMonth = 11; calYear--; }
        renderCalendar();
    });

    document.getElementById('cal-next').addEventListener('click', function() {
        calMonth++;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        renderCalendar();
    });
}

// ========== RSS FEED DE IA ==========
async function loadAINews() {
    // Usando TechCrunch AI feed pelo rss2json
    const rssUrl = 'https://techcrunch.com/category/artificial-intelligence/feed/';
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const newsList = document.getElementById('news-list');
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
            newsList.innerHTML = '';
            // Pegar as 4 notícias mais recentes para preencher bem o espaço
            const topNews = data.items.slice(0, 4);
            
            topNews.forEach(item => {
                const date = new Date(item.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                
                const html = `
                    <a href="${item.link}" target="_blank" class="news-item">
                        <span class="news-title">${item.title}</span>
                        <span class="news-meta">TechCrunch • ${date}</span>
                    </a>
                `;
                newsList.insertAdjacentHTML('beforeend', html);
            });
        } else {
            newsList.innerHTML = '<span class="news-loading" style="color: #ef4444">Feed indisponível no momento.</span>';
        }
    } catch (error) {
        newsList.innerHTML = '<span class="news-loading" style="color: #ef4444">Erro ao conectar com o radar.</span>';
    }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', function() {
    renderPoster();
    setupCopyButton();
    setupScrollAnimations();
    initCalendar();
    loadAINews();
});
