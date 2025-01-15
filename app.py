from flask import Flask, render_template, request  
import random  
import ipaddress  

app = Flask(__name__)  

def generate_random_ip_from_ranges(cidr_ranges):  
    selected_cidr = random.choice(cidr_ranges)  
    network = ipaddress.IPv4Network(selected_cidr)  
    ips = list(network.hosts())  
    random_ip = random.choice(ips)  
    return str(random_ip)  

# تعیین محدوده‌های IP برای کشورها  
countries_ip_ranges = {  
    2: {  
        "country": "UAEipv4",  
        "ranges": [  
            "194.110.155.0/24",  
            "194.117.51.0/24",  
            "194.146.236.0/22",  
            "194.153.153.128/25",  
            "194.165.2.0/23",  
            "195.95.219.0/24"  
        ]  
    }  
}  

@app.route("/", methods=["GET", "POST"])  
def index():  
    output = ""  
    if request.method == "POST":  
        # انتخاب یک کشور به طور تصادفی  
        number = random.choice(list(countries_ip_ranges.keys()))  
        country_name = countries_ip_ranges[number]["country"]  
        ip_ranges = countries_ip_ranges[number]["ranges"]  
        random_ip = generate_random_ip_from_ranges(ip_ranges)  

        # افزودن آدرس IP به خروجی  
        output = f"آدرس IP تولید شده برای کشور {country_name} (عدد کشور {number}): {random_ip}"  

    return render_template("index.html", output=output)  

if __name__ == "__main__":  
    app.run(debug=True)