import os
import time
import sys
import wifi
import board
import gc
import socketpool
import ssl
import adafruit_minimqtt.adafruit_minimqtt as MQTT
from adafruit_minimqtt.adafruit_minimqtt import MMQTTException
import digitalio
import touchio

# Create a socket pool
pool = socketpool.SocketPool(wifi.radio)

last_ping = 0
ping_interval = 30

def network_connect():
    try:
        wifi.radio.connect(os.getenv('WIFI_SSID'), os.getenv('WIFI_PASSWORD'))
        print("My IP address is: ", wifi.radio.ipv4_address)
    except ConnectionError as e:
        reset_on_error(10, e)

# Define callback methods which are called when events occur
# pylint: disable=unused-argument, redefined-outer-name
def connected(client, userdata, flags, rc):
    # This function will be called when the client is connected
    # successfully to the broker.
    print("Connected to broker!\n")

def disconnected(client, userdata, rc):
    print("Disconnected from broker!\n")


def mqtt_connect():
    global client

    # Set up a MiniMQTT Client
    client = MQTT.MQTT(
        broker=os.getenv('BROKER'),
        port=os.getenv('PORT'),
        username=os.getenv('MQTT_USER'),
        password=os.getenv('MQTT_PW'),
        #client_id=os.getenv("CLIENT_ID"),
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

def reset_on_error(delay, error):
    print("Error:\n", str(error))
    print("Resetting microcontroller in %d seconds" % delay)
    time.sleep(delay)
    microcontroller.reset()

def reconnect():
    print("Restarting...")
    network_connect()
    client.reconnect()

try:
    # Connect to the WIFI, use settings.toml to configure SSID and Password
    print("Connecting to WiFi\n")

    network_connect()
    print("Connected to WiFi\n")
    mqtt_connect()
    print("Connected to MQTT\n")
except KeyboardInterrupt:
    sys.exit()
except Exception as e:
    # Handle connection error
    # For this example we will simply print a message and exit the program
    print("Failed to connect, aborting.")
    print("Error:\n", str(e))
    sys.exit()
    
touch_A3 = touchio.TouchIn(board.A3)
touch_A3.threshold = 60000
is_touched = False

while True:
    try:
        # check wifi is connected:
        if wifi.radio.connected == False:
            print("wifi disconnected")
            reconnect()

        #print("mem start loop:", gc.mem_free())
        if (time.time() - last_ping) > ping_interval:
            print("ping broker")
            client.ping()
            last_ping = time.time()

        print(touch_A3.raw_value)
        if touch_A3.value:
            print(touch_A3.value)
            print("touched!")

            # Send a new message
            client.publish(os.getenv("TOPIC"), "hi")
            print("Sent!")
            time.sleep(2)

        # Poll the message queue
        client.loop()

        gc.collect()
        time.sleep(0.05)
    except KeyboardInterrupt:
        client.disconnect()
        break
    except Exception as e:
        print("Failed to get data, retrying\n", e)
        reconnect()
        continue
