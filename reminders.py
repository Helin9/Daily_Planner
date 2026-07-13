import time
from plyer import notification

def set_reminder(title, message, delay_seconds):
    time.sleep(delay_seconds)
    notification.notify(
        title=title,
        message=message,
        app_name='Quick Reminder',
        timeout=10
    )

# Example: Set a reminder for "Drink water" in 5 seconds
set_reminder("Time to Hydrate!", "Don't forget to drink some water.", 5)
