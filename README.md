# love-notes-chatgpt + giant pompom:

![pompom-schematic](https://github.com/traumverloren/love-notes-chatgpt/assets/9959680/9f4ca221-563d-4344-aff8-2877d32b836e)


## Materials:

### Pom pom:
- Adafruit QT Py ESP32-S2
- Conductive thread
- Ridiculous amount of yarn
- Cardboard (to make a pom pom template)
- LiPo battery (optional)
- Adafruit QT PY ESP32-S@ BFF Lipo backpack (optional)

### RPi + E-ink:
- Waveshare 7.5 e-ink screen w/ Pi HAT
- Raspberry Pi (Works with multiple, but I used an old RPi 3)

## RPi Setup:
- format sd card w/ [raspberry pi imager](https://www.raspberrypi.com/software/)
- install [nvm](https://github.com/nvm-sh/nvm) (`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`)
- install node using nvm (`nvm install --lts`)
- `npm i`
- `npm start`
- Add a `.env` file with secrets:
  ```bash
  OPENAI_API_KEY
  MQTT_HOST  # broker url
  MQTT_USER
  MQTT_PASSWORD
  CLIENT_ID
  TOUCH_TOPIC
  OPENAI_CONTENT # your prompt
  ```
 
## QT PY ESP-32 Setup:
- Download `.uf2` file: [CircuitPython 8.2.0-beta](https://circuitpython.org/board/adafruit_qtpy_esp32s2/) (Necessary for touchalarm functionality!)
- Put in bootmode and drag/drop circuitpython to drive in finder view
- Using MU editor, create a `settings.toml` file with following secrets:
  ```python
  ssid=""
  wifi_pw=""
  broker=""
  port=
  user=""
  pw=""
  client_id=""
  topic=""
  ```
- Add necessary dependencies to `lib` folder from [Adafruit circuitpython bundle](https://github.com/adafruit/Adafruit_CircuitPython_Bundle):
  - `[adafruit_minimqtt](https://github.com/adafruit/Adafruit_CircuitPython_MiniMQTT)` (copy entire folder)
### Optional:

#### To launch on boot using systemd:

- Make sure node and npm are symlink since we use nvm:

  ```
  sudo ln -s "$(which node)" /usr/bin/node
  sudo ln -s "$(which npm)" /usr/bin/npm
  ```

- Setup a `eink.service` file:

  `sudo nano /lib/systemd/system/eink.service`

  with:

  ```
  [Unit]
  Description=chatgpt ascii art displayer
  After=network-online.target
  Wants=network-online.target

  [Service]
  Type=simple
  User=pi
  WorkingDirectory=/home/pi/love-notes-chatgpt
  ExecStart=/usr/bin/npm start
  Restart=on-failure
  RestartSec=30

  [Install]
  WantedBy=multi-user.target
  ```

- Test the config:

  `sudo systemctl start eink`

- Check for errors in log:

  `sudo journalctl -xfu eink`

- If need to edit, restart it with:

  `sudo systemctl daemon-reload`

- Restart it:

  `sudo systemctl restart eink`

- To stop:

  `sudo systemctl stop eink`

- To enable it once it looks good:

  `sudo systemctl enable eink` and `sudo reboot`
