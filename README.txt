project 구조/
├── api/
│   ├── heritageImageApi.js        # Handles image data from external APIs.
│   ├── heritageInfoDetailApi.js   # Handles heritage info details.
├── db/
│   ├── pgClient.js                # PostgreSQL connection setup.
├── models/
│   ├── heritageImage.js           # HeritageImage data model.
│   ├── heritage.js              # Heritage data model.
├── routes/
│   ├── heritageRoutes.js          # RESTful endpoints for API interaction.
├── app.js                         # Main entry point for the server.
|
ㄴ────────────app(testial things) 
                # /fetcher = Openapi Importer (20)
                # /(main page) = PostgreSQL Importer (5)

사용법 : 
        1. node app.js 입력(모듈 다운받고)
        2. http://localhost:8000/ 예시 5개 출력 확인 
        3. http://localhost:8000/fetcher  20개 출력 확인   
