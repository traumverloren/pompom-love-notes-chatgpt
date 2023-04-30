# love-notes-chatgpt


## To start:

`npm start`

## To launch on boot using systemd:

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
