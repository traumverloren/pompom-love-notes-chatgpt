import alarm
import board
import time
import ssl
import socketpool
import wifi
import neopixel
import adafruit_minimqtt.adafruit_minimqtt as MQTT
from adafruit_minimqtt.adafruit_minimqtt import MMQTTException

# Must degrade to circuitpython 7.1.0 to use touchalarm
# ensure neopixel package matches version (dec 28 2021) or it will crash hard

# Get wifi details and more from a secrets.py file
try:
    from secrets import secrets
except ImportError:
    print("WiFi secrets are kept in secrets.py, please add them there!")
    raise

# Create a socket pool
pool = socketpool.SocketPool(wifi.radio)

# Create an alarm that will trigger if pin is touched.
touch_alarm = alarm.touch.TouchAlarm(pin=board.A3)

# Print out which alarm woke us up, if any.
print(alarm.wake_alarm)

pixel = neopixel.NeoPixel(board.NEOPIXEL, 1)
pixel.fill((0,255,255))

def network_connect():
    print("Connecting to %s"%secrets["ssid"])
    wifi.radio.connect(secrets["ssid"], secrets["wifi_pw"])
    print("Connected to %s!"%secrets["ssid"])
    print("My IP address is", wifi.radio.ipv4_address)

def connected(client, userdata, flags, rc):
    # This function will be called when the client is connected
    # successfully to the broker.
    print("Connected to broker!")

def disconnected(client, userdata, rc):
    print("Disconnected from broker!")

def mqtt_connect():
    global client

    # Set up a MiniMQTT Client
    client = MQTT.MQTT(
        broker=secrets["broker"],
        port=secrets["port"],
        username=secrets["user"],
        password=secrets["pw"],
        socket_pool=pool,
        is_ssl=True,
        ssl_context=ssl.create_default_context(),
        keep_alive=60,
    )

    # Setup the callback methods above
    client.on_connect = connected
    client.on_disconnect = disconnected

    # Connect the client to the MQTT broker.
    print("Connecting to MQTT broker...")
    client.connect()

print("Connecting WIFI")
network_connect()
mqtt_connect()

# Send a new message
if alarm.wake_alarm:
    client.publish(secrets["topic"], "hi")
    print("Sent!")
print("sleepytime...")
client.disconnect()
pixel.fill((0,0,0))
time.sleep(2)

# Exit the program, and then deep sleep until one of the alarms wakes us.
alarm.exit_and_deep_sleep_until_alarms(touch_alarm)
# Does not return, so we never get here.
