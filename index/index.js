// DNS data
const dnsData = {
    de: {
        ipv4: ["84.128.0.0/10", "93.192.0.0/10", "104.132.3.0/24", "104.132.18.0/24", "104.132.173.0/24"],
        ipv6: ["2003::/19", "2003:1800::/22", "2a11:7400::/32"]
    },
    USA: {
        ipv4: ["73.72.0.0/14", "73.196.0.0/14", "34.128.0.0/10", "172.253.0.0/16"],
        ipv6: ["2600:1900::/28", "2600:2d00::/28", "2604:31c0::/32"]
    },
    uk: {
        ipv4: ["89.249.64.0/20", "217.64.112.0/20", "77.243.176.0/20", "89.238.128.0/18"],
        ipv6: ["2a01:300::/29", "2a02:40::/32", "2001:ac8::/32", "2a03:34c0::/32"]
    },
    taiwan: {
        ipv4: ["66.171.112.0/20", "208.70.200.0/21", "104.132.42.0/24", "104.132.150.0/24"],
        ipv6: ["2401:fa00:3b::/48", "2401:fa00:f0::/48", "2401:fa00:f1::/48"]
    },
    uae: {
        ipv4: ["118.67.224.0/20", "109.177.0.0/16", "107.165.3.0/24", "92.96.0.0/14", "86.96.0.0/14"],
        ipv6: ["2001:8f8::/29"]
    }
};

// Convert IP to number
function ipToLong(ip) {
    return ip.split('.')
        .reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

// Convert number to IP
function longToIP(long) {
    return [
        (long >>> 24) & 0xFF,
        (long >>> 16) & 0xFF,
        (long >>> 8) & 0xFF,
        long & 0xFF
    ].join('.');
}

// Generate random IP from CIDR
function generateRandomIPFromCIDR(cidr) {
    const [ip, bits] = cidr.split('/');
    const ipLong = ipToLong(ip);
    const mask = ~((1 << (32 - bits)) - 1);
    const networkAddr = ipLong & mask;
    const broadcastAddr = networkAddr | ~mask;
    const randomLong = networkAddr + Math.floor(Math.random() * (broadcastAddr - networkAddr));
    return longToIP(randomLong);
}

// Generate random IPv6 from CIDR
function generateRandomIPv6FromCIDR(cidr) {
    const [prefix, bits] = cidr.split('/');
    const prefixSegments = prefix.split(':');
    const segmentCount = Math.ceil(bits / 16);
    let result = prefixSegments.slice(0, segmentCount);

    while (result.length < 8) {
        result.push(Math.floor(Math.random() * 65536).toString(16));
    }

    return result.join(':');
}

// Theme toggle functionality
const themeSwitch = document.getElementById('theme-switch');
const body = document.body;

themeSwitch.addEventListener('change', () => {
    const theme = themeSwitch.checked ? 'dark' : 'light';
    body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeColors();
});

// Update theme colors
function updateThemeColors() {
    const backgroundColor = themeSwitch.checked ? 'rgba(90, 24, 154, 0.1)' : 'rgba(90, 24, 154, 0.05)';
    document.querySelectorAll('.card, .dns-section').forEach(el => {
        el.style.backgroundColor = backgroundColor;
    });
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
themeSwitch.checked = savedTheme === 'dark';
body.setAttribute('data-theme', savedTheme);
updateThemeColors();

// DNS functionality
const countrySelect = document.getElementById('country-select');
const ipv4Fields = [document.getElementById('ipv4-1'), document.getElementById('ipv4-2')];
const ipv6Fields = [document.getElementById('ipv6-1'), document.getElementById('ipv6-2')];

countrySelect.addEventListener('change', () => {
    const country = countrySelect.value;
    if (country && dnsData[country]) {
        ipv4Fields.forEach(field => field.value = '');
        ipv6Fields.forEach(field => field.value = '');
    }
});

// Unified copy functionality with animation and notifications
function copyToClipboard(value) {
    // Handle both element IDs and direct values
    let textToCopy;
    if (document.getElementById(value)) {
        const element = document.getElementById(value);
        textToCopy = element.value || element.textContent || element.querySelector('.dns-address')?.textContent;
    } else {
        textToCopy = value;
    }

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            // Find the relevant button or card
            let targetElement;
            if (document.getElementById(value)) {
                const element = document.getElementById(value);
                targetElement = element.classList.contains('dns-card') ? 
                    element : 
                    element.nextElementSibling;
            }

            // Add animation if there's a target element
            if (targetElement) {
                targetElement.classList.add('animate__animated', 'animate__bounce');
                
                if (!targetElement.classList.contains('dns-card')) {
                    const originalIcon = targetElement.innerHTML;
                    targetElement.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        targetElement.innerHTML = originalIcon;
                        targetElement.classList.remove('animate__animated', 'animate__bounce');
                    }, 1000);
                } else {
                    setTimeout(() => {
                        targetElement.classList.remove('animate__animated', 'animate__bounce');
                    }, 1000);
                }
            }

            // Show notification
            const notification = document.createElement('div');
            notification.className = 'copy-notification';
            notification.textContent = 'کپی شد!';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #374BFF;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                font-family: 'Vazirmatn', sans-serif;
            `;
            document.body.appendChild(notification);
            
            // Animate notification
            setTimeout(() => {
                notification.style.opacity = '1';
            }, 100);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
        })
        .catch(err => {
            console.error('خطا در کپی کردن:', err);
            const notification = document.createElement('div');
            notification.className = 'copy-notification error';
            notification.textContent = 'خطا در کپی کردن!';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #f44336;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                z-index: 1000;
                opacity: 1;
                font-family: 'Vazirmatn', sans-serif;
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        });
}

// Add required CSS
const style = document.createElement('style');
style.textContent = `
    .copy-notification {
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .copy-notification.error {
        background-color: #f44336;
    }
    .dns-card.animate__bounce {
        cursor: pointer;
    }
`;
document.head.appendChild(style);

// Handle DNS Generator Button
// document.getElementById("generate-dns").addEventListener("click", () => {
//     const country = countrySelect.value;
//     if (country && dnsData[country]) {
//         const randomIPv4Ranges = dnsData[country].ipv4.sort(() => Math.random() - 0.5).slice(0, 2);
//         const randomIPv6Ranges = dnsData[country].ipv6.sort(() => Math.random() - 0.5).slice(0, 2);

//         ipv4Fields[0].value = generateRandomIPFromCIDR(randomIPv4Ranges[0]);
//         ipv4Fields[1].value = "Electro - Radar";
        // مقدار اولیه آدرس IPv6
ipv6Fields[0].value = generateRandomIPv6FromCIDR(randomIPv6Ranges[0]);

// گرفتن مقدار از آدرس قبلی و تغییر حرف یا عدد آخر
let ipv6Address = ipv6Fields[0].value;
let modifiedIPv6 = ipv6Address.slice(0, -1) + getRandomHexChar(); // جایگزینی آخرین کاراکتر

// تنظیم مقدار جدید در فیلد ipv6Fields[1]
ipv6Fields[1].value = modifiedIPv6;

// تابع تولید یک کاراکتر تصادفی بین حروف و اعداد هگزادسیمال
function getRandomHexChar() {
    const hexChars = "0123456789abcdef";
    return hexChars[Math.floor(Math.random() * hexChars.length)];
}


// Hide loading screen after page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loadingScreen = document.querySelector('.loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);
});

// Prevent opening DevTools (optional)
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
