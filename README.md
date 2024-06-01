# bdo-seiges

<div align="center" width="100%">
  <img src="./docs/preview.png" alt="demo" style="border-radius: 8px" />
</div>

Интерактивная карта для стадии планировани осад в Black Desert Online. Позволяет разместить на игровой карте различные объекты для визуализации процесса осады. [Приложение можно попробовать здесь](https://sieges.exi.moe/)

## Сборка

```
npm i && npm run build
```

## Результаты осад

В проекте присутствует `/public/result.json` - это ответ от игрового API

```shell
curl --location 'https://game.ru.playblackdesert.com/GuildRank/Index/GetGuildRankList' \
--header 'User-Agent: BlackDesert' \
--form 'rankingType="1"' \
--form 'page="1"' \
--form 'pageLength="255"'
```

Вы можете настроить cron для получения данных после завершения осад

```shell
5 22 * * 0-5 curl --location 'https://game.ru.playblackdesert.com/GuildRank/Index/GetGuildRankList' \
--header 'User-Agent: BlackDesert' \
--form 'rankingType="1"' \
--form 'page="1"' \
--form 'pageLength="255"' > /var/www/your/path/to/project/result.json
```
