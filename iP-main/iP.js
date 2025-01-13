let isRequestInProgress = false; // جلوگیری از درخواست‌های همزمان

async function lookupIP() {
    const ip = document.getElementById('ipInput').value.trim();
    const resultDiv = document.getElementById('result');

    // نمایش resultDiv اگر مخفی است
    resultDiv.style.display = 'block';

    // تابع نمایش پیام با انیمیشن
    const showMessage = (message, type) => {
        resultDiv.style.opacity = '0';

        setTimeout(() => {
            resultDiv.textContent = message;
            resultDiv.className = 'result fade-in';

            switch (type) {
                case 'error':
                    resultDiv.style.borderColor = '#ff4444';
                    resultDiv.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
                    break;
                case 'success':
                    resultDiv.style.borderColor = '#00C851';
                    resultDiv.style.backgroundColor = 'rgba(0, 200, 81, 0.1)';
                    break;
                default:
                    resultDiv.style.borderColor = 'var(--accent)';
                    resultDiv.style.backgroundColor = 'var(--card-bg)';
            }

            resultDiv.style.opacity = '1';
        }, 200);
    };

    // اعتبارسنجی IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ip) {
        showMessage('لطفاً یک آدرس IP معتبر وارد کنید.', 'error');
        return;
    }
    if (!ipRegex.test(ip)) {
        showMessage('فرمت IP وارد شده صحیح نیست.', 'error');
        return;
    }

    // جلوگیری از ارسال درخواست همزمان
    if (isRequestInProgress) {
        showMessage('لطفاً منتظر پاسخ باشید...', 'error');
        return;
    }
    isRequestInProgress = true;

    // نمایش لودینگ
    resultDiv.innerHTML = `
        <div class="loading-box">
            <div class="inner-box"></div>
        </div>
        <p style="margin-top: 1rem">در حال دریافت اطلاعات...</p>
    `;

    try {
        const response = await fetch(`https://api.iplocation.net/?cmd=ip-country&ip=${ip}`);
        if (!response.ok) {
            throw new Error('خطا در دریافت پاسخ از سرور');
        }

        const data = await response.json();
        if (data.country_name) {
            showMessage(`کشور: ${data.country_name}`, 'success');
        } else {
            showMessage('کشور برای این IP یافت نشد.', 'error');
        }
    } catch (error) {
        showMessage('خطا در دریافت داده. لطفاً دوباره امتحان کنید.', 'error');
        console.error('Error:', error);
    } finally {
        // مخفی کردن لودینگ بعد از پایان درخواست
        resultDiv.innerHTML = '';
        isRequestInProgress = false;
    }
}

// اضافه کردن قابلیت جستجو با Enter
document.getElementById('ipInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        lookupIP();
    }
});

// مدیریت منوی فعال
document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".header-list a");
    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    links.forEach(link => {
        const linkPath = link.getAttribute("href");

        if (linkPath === currentPath ||
            (currentPath === "index.html" && linkPath === "") ||
            (currentPath === "" && linkPath === "index.html") ||
            (currentPath === "iP.html" && linkPath === "iP/iP.html")) { // اصلاح مسیر برای صفحه iP.html

            link.classList.add("active");
            const listItem = link.querySelector('li');
            if (listItem) {
                listItem.classList.add("active");
            }

            // اضافه کردن افکت ویژه به لینک فعال
            link.style.backgroundColor = 'var(--card-bg)';
            link.style.borderColor = 'var(--accent)';
            link.style.color = 'var(--accent)';
        }
    });
    
    // بارگذاری تم از localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // اضافه کردن دکمه تغییر تم
    const themeSwitch = document.getElementById('theme-switch');
    themeSwitch.addEventListener('change', () => {
        toggleTheme();
    });
});

// تابع برای تغییر تم
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // ذخیره‌سازی تم انتخاب شده در localStorage
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
}

// اضافه کردن انیمیشن به ورودی‌ها در هنگام لود صفحه
setTimeout(() => {
    const input = document.getElementById('ipInput');
    const button = document.querySelector('.searchbtn');
    input.classList.add('fade-in');
    button.classList.add('fade-in');
}, 100);

// پنهان کردن صفحه لودینگ بعد از بارگذاری کامل
window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hide');
    }
});

const toggleSwitch = document.querySelector('.switch input');
const body = document.querySelector('body');

toggleSwitch.addEventListener('change', () => {
    if (toggleSwitch.checked) {
        body.setAttribute('data-theme', 'light');
    } else {
        body.removeAttribute('data-theme');
    }
});

// جلوگیری از باز کردن DevTools
(function() {
    var preventDevTools = function() {
        Object.defineProperty(window, 'devtools', {
            get: function() { return true; },
            set: function() { return true; }
        });
    };

    preventDevTools();

    // جلوگیری از راست کلیک
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });

    // جلوگیری از استفاده از F12 و Ctrl+Shift+I
    document.onkeydown = function(event) {
        if (event.keyCode === 123 || (event.ctrlKey && event.shiftKey && event.keyCode === 73)) {
            event.preventDefault();
        }
    };
})();
