// رنج‌های از پیش تعیین شده
const CONFIG_RANGES = {
    addressIPv4: ["136.32.0.0/11", "23.255.128.0/17", "107.188.128.0/17"],  // چند رنج IPv4
    addressIPv6: ["2605:a600::/31", "2003:40:8800::/37"],  // چند رنج IPv6
    endpointIPv4: ["136.32.0.0/11", "23.255.128.0/17", "107.188.128.0/17"],    // چند رنج endpoint IPv4
    endpointIPv6: ["2605:a600::/31", "2003:40:8800::/37"]  // چند رنج endpoint IPv6
};

// تابع برای تولید یک رشته تصادفی
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// تبدیل رشته به Base64
function encodeBase64(str) {
    return btoa(str);  // استفاده از btoa برای تبدیل به Base64
}

// تولید کلیدهای تصادفی
function generateKeypair() {
    const privateKey = generateRandomString(32);  // تولید کلید خصوصی تصادفی
    const publicKey = generateRandomString(32);   // تولید کلید عمومی تصادفی

    // تبدیل کلیدها به Base64
    const privateKeyBase64 = encodeBase64(privateKey);
    const publicKeyBase64 = encodeBase64(publicKey);

    return {
        privateKey: privateKeyBase64,  // کلید خصوصی به فرمت Base64
        publicKey: publicKeyBase64     // کلید عمومی به فرمت Base64
    };
}

// تولید آدرس IPv4
function generateIPv4() {
    const range = CONFIG_RANGES.addressIPv4[Math.floor(Math.random() * CONFIG_RANGES.addressIPv4.length)];  // انتخاب تصادفی یک رنج
    const [base, bits] = range.split('/');
    const baseNum = base.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
    const mask = ~((1 << (32 - bits)) - 1);
    const randomNum = (baseNum & mask) + Math.floor(Math.random() * (1 << (32 - bits)));
    return [
        (randomNum >> 24) & 255,
        (randomNum >> 16) & 255,
        (randomNum >> 8) & 255,
        randomNum & 255
    ].join('.');
}

// تولید آدرس IPv6
function generateIPv6() {
    const range = CONFIG_RANGES.addressIPv6[Math.floor(Math.random() * CONFIG_RANGES.addressIPv6.length)];  // انتخاب تصادفی یک رنج
    const [prefix, bits] = range.split('/');
    const prefixSegments = prefix.split(':').filter(s => s).map(s => parseInt(s, 16));
    const randomSegments = Array(8 - prefixSegments.length).fill(0)
        .map(() => Math.floor(Math.random() * 0x10000));
    return [...prefixSegments, ...randomSegments].map(s => s.toString(16).padStart(4, '0')).join(':');
}

// بررسی رمز عبور
function validatePassword() {
    const password = document.getElementById('password').value;
    const correctPassword = 'vip';  // رمز عبور ثابت

    if (password !== correctPassword) {
        alert('رمز عبور اشتباه است');
        return false;
    }
    return true;
}

// تولید کانفیگ
function generateConfig() {
    if (!validatePassword()) {
        return;
    }

    const port = document.getElementById('port').value;
    if (!port || isNaN(port) || port < 1 || port > 65535) {
        alert('لطفاً یک شماره پورت معتبر وارد کنید (1 تا 65535)');
        return;
    }

    const keys = generateKeypair();

    const addressIPv4 = generateIPv4();
    const addressIPv6 = generateIPv6();
    const endpointIPv4 = generateIPv4();
    const dnsIPv4 = generateIPv4();

    const config = `[Interface]
PrivateKey = ${keys.privateKey}
Address = ${addressIPv4}/32, ${addressIPv6}/128
DNS = 78.157.42.100, ${dnsIPv4}

[Peer]
PublicKey = ${keys.publicKey}
Endpoint = ${endpointIPv4}:${port}
`;

    document.getElementById('output').textContent = config;
}

// دانلود کانفیگ
function downloadConfig() {
    const config = document.getElementById('output').textContent;
    if (!config) {
        alert('لطفا ابتدا کانفیگ را تولید کنید');
        return;
    }

    const fileName = document.getElementById('fileName').value.trim();

    // اگر نام فایل وارد نشده باشد
    if (!fileName) {
        alert('لطفاً نام فایل را وارد کنید');
        return;
    }

    // ایجاد فایل Blob
    const blob = new Blob([config], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName + '.conf';  // پسوند .conf برای فایل
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}


// تغییر تم به روشن یا تاریک
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');

    if (body.dataset.theme === 'dark') {
        body.dataset.theme = 'light';
        themeIcon.classList.remove('bi-moon');
        themeIcon.classList.add('bi-sun');
        localStorage.setItem('theme', 'light'); // ذخیره‌سازی تم در localStorage
    } else {
        body.dataset.theme = 'dark';
        themeIcon.classList.remove('bi-sun');
        themeIcon.classList.add('bi-moon');
        localStorage.setItem('theme', 'dark'); // ذخیره‌سازی تم در localStorage
    }
}

// تنظیم تم پیش‌فرض بر اساس تنظیمات سیستم یا ذخیره‌شده در localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.dataset.theme = savedTheme;
    document.getElementById('themeIcon').classList.add(savedTheme === 'dark' ? 'bi-moon' : 'bi-sun');
} else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.dataset.theme = 'dark';
        document.getElementById('themeIcon').classList.add('bi-moon');
    } else {
        document.body.dataset.theme = 'light';
        document.getElementById('themeIcon').classList.add('bi-sun');
    }
}

// // Prevent opening DevTools (optional)
(function() {
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });

    document.onkeydown = function(event) {
        if (event.keyCode === 123 || (event.ctrlKey && event.shiftKey && event.keyCode === 73)) {
            event.preventDefault();
        }
    };
})();
