import calendar
from datetime import datetime, timedelta, timezone

now = datetime.now(timezone.utc)  # Hora actual UTC
expire = now + (timedelta(minutes=1))
expire_ts = calendar.timegm(expire.utctimetuple())  # Timestamp UTC correcto

print(now)
print(expire)
print(expire_ts)
