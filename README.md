# Hug a giant pom pom to send esoteric messages to an e-ink display:

Ever wanted to spend days winding a ton of yarn to make a giant pom pom? What that pom pom to be able to react to hugging to send cryptic ASCII art and a short esoteric message to multiple e-ink displays? Don't have the latest PI due to the shortages but have an old RPI lying around? 

Well, here ya go!

![pompom-schematic](https://github.com/traumverloren/pompom-love-notes-chatgpt/assets/9959680/54f2644a-4587-4383-a6c1-d5ddd85d21a4)

## Materials:
### Pom pom:
- [Adafruit QT Py ESP32-S2](https://www.adafruit.com/product/5325)
- [Conductive thread](https://lightstitches.co.uk/product/conductive-thread-reel-250m/)
- Ridiculous amount of yarn
- Cardboard (to make a pom pom template)
- 400mAh LiPo battery (optional)
- [Adafruit QT PY ESP32-S2 BFF](https://www.adafruit.com/product/5397) Lipo backpack (optional)

  
#### Create the giant pom pom (this took ~20 x 50g bundles of yarn):
![pompom-small](https://github.com/traumverloren/pompom-love-notes-chatgpt/assets/9959680/3c4b65bc-e520-408c-bcce-1293b7d5b84d)


#### Make sure to put in a small container to hold the microcontroller (& battery inside):
![pompominside Medium](https://github.com/traumverloren/pompom-love-notes-chatgpt/assets/9959680/e2863756-cbdd-4417-a29e-46f6e284af43)


### RPi + E-ink:
- Waveshare 7.5 e-ink screen w/ Pi HAT
- Raspberry Pi (Works with multiple, but I used an old RPi 3)
- Picture frame (there's one that works from ikea or this one from [modulor](https://www.modulor.de/objektrahmen-holz-moritz-p-36-x-14-cm-schwefelgelb-ral-1016.html))

#### Mount e-ink display & pi into a picture frame:
![IMG_4919 Medium](https://github.com/traumverloren/pompom-love-notes-chatgpt/assets/9959680/d6eef7d7-6004-4885-8ff6-9816a1b0fb58)

![6DD1C812-F45E-4DD4-B626-C3976EF0C59E Medium](https://github.com/traumverloren/pompom-love-notes-chatgpt/assets/9959680/1b86bfad-2b53-4ab0-bbe0-7851cbaea3ec)

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
