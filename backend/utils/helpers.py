import random
import string
from datetime import datetime
import base64

# uid: random 8-char base36-like string
def uid():
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choice(chars) for _ in range(8))


# now: ISO timestamp
def now():
    return datetime.utcnow().isoformat() + "Z"


# fmtDate: "Apr 14, 2026"
def fmtDate(d):
    dt = datetime.fromisoformat(d.replace("Z", ""))
    return dt.strftime("%b %d, %Y")


# fmtTime: "03:45 PM"
def fmtTime(d):
    dt = datetime.fromisoformat(d.replace("Z", ""))
    return dt.strftime("%I:%M %p")


# fmtCurrency: ₱1,234.56
def fmtCurrency(v, sym='₱'):
    try:
        num = float(v or 0)
    except:
        num = 0.0
    return f"{sym}{num:,.2f}"


# hashPass: base64(s + salt)
def hashPass(s):
    salted = (s + 'sf_salt_2025').encode('utf-8')
    return base64.b64encode(salted).decode('utf-8')