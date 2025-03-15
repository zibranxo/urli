from flask import Flask, request, jsonify, redirect, render_template, send_file
import sqlite3
import random
import string
import qrcode
from io import BytesIO
import os

app = Flask(__name__, static_folder="static", template_folder="templates")

# Generate a short URL code
def generate_short_code(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# Initialize the database
def init_db():
    if not os.path.exists("urls.db"):  # Check if database file exists
        conn = sqlite3.connect('urls.db')
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                short TEXT UNIQUE,
                long TEXT,
                clicks INTEGER DEFAULT 0
            )
        ''')
        conn.commit()
        conn.close()

# Home Page
@app.route('/')
def home():
    return render_template("index.html")

# Shorten URL Page
@app.route('/shorten-page')
def shorten_page():
    return render_template("shorten.html")

# Analytics Page
@app.route('/analytics-page')
def analytics_page():
    return render_template("analytics.html")

# QR Code Page
@app.route('/qr-page')
def qr_page():
    return render_template("qr.html")

# Shorten URL API
@app.route('/shorten', methods=['POST'])
def shorten_url():
    data = request.get_json()
    long_url = data.get("url")

    if not long_url:
        return jsonify({"error": "URL is required"}), 400

    short_code = generate_short_code()
    short_url = f"http://127.0.0.1:5000/{short_code}"  # Generate short URL

    # Store in database
    conn = sqlite3.connect('urls.db')
    c = conn.cursor()
    c.execute("INSERT INTO urls (short, long, clicks) VALUES (?, ?, ?)", (short_code, long_url, 0))
    conn.commit()
    conn.close()

    return jsonify({
        "short_url": short_url,
        "qr_code": f"http://127.0.0.1:5000/qr/{short_code}"
    })

# Redirect short URL to the original URL
@app.route('/<short_code>')
def redirect_url(short_code):
    conn = sqlite3.connect('urls.db')
    c = conn.cursor()
    c.execute("SELECT long, clicks FROM urls WHERE short=?", (short_code,))
    result = c.fetchone()

    if result:
        new_clicks = result[1] + 1
        c.execute("UPDATE urls SET clicks = ? WHERE short=?", (new_clicks, short_code))
        conn.commit()
        conn.close()
        return redirect(result[0])
    else:
        conn.close()
        return render_template("404.html"), 404  # Render a 404 page instead of plain text

# Get analytics for a specific short URL
@app.route('/analytics/<short_code>')
def get_analytics(short_code):
    conn = sqlite3.connect('urls.db')
    c = conn.cursor()
    c.execute("SELECT clicks FROM urls WHERE short=?", (short_code,))
    result = c.fetchone()
    conn.close()

    if result:
        return jsonify({"short_code": short_code, "clicks": result[0]})
    else:
        return jsonify({"error": "Short URL not found"}), 404

# Get analytics for all URLs
@app.route('/analytics', methods=['GET'])
def analytics():
    conn = sqlite3.connect('urls.db')
    c = conn.cursor()
    c.execute("SELECT short, long, clicks FROM urls ORDER BY clicks DESC")
    data = c.fetchall()
    conn.close()

    analytics_data = [{"short_url": f"http://127.0.0.1:5000/{row[0]}", "long_url": row[1], "clicks": row[2]} for row in data]

    return jsonify(analytics_data)

# Generate QR code for a short URL
@app.route('/qr/<short_code>')
def generate_qr(short_code):
    short_url = f"http://127.0.0.1:5000/{short_code}"

    # Generate QR code
    qr = qrcode.make(short_url)
    img_io = BytesIO()
    qr.save(img_io, 'PNG')
    img_io.seek(0)

    return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
    init_db()  # Initialize database before running
    app.run(debug=True)
