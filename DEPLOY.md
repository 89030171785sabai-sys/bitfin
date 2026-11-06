# Автоматическая публикация на REG.RU

Сайт публикуется из `dist/variant-2.html`. Во время деплоя файл переименовывается в `index.html` и загружается на хостинг REG.RU.

## Секреты GitHub Actions

В репозитории откройте **Settings → Secrets and variables → Actions → New repository secret** и добавьте:

- `FTP_SERVER` — FTP-сервер из раздела «Доступы» REG.RU;
- `FTP_USERNAME` — логин FTP;
- `FTP_PASSWORD` — пароль FTP;
- `FTP_SERVER_DIR` — корневая папка сайта, обязательно с `/` в конце.

После добавления секретов запустите **Actions → Deploy website to REG.RU by FTP → Run workflow**. В дальнейшем деплой запускается автоматически после каждого push в ветку `main`.

