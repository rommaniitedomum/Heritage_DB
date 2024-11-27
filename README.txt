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
        2. http://localhost:8000/ 예시 5개 출력 확인 (PostgreSQL연동확인)
        3. http://localhost:8000/fetcher  2개 출력 확인(전체데이터 확인용)  
        4. http://localhost:8000/fetcher2  1개 출력 확인(사용데이터 확인용)     
        5. http://localhost:8000/heritage 테스트 카드 (알아서 수정)
        6. http://localhost:8000/heritageTitle 제목 카드 (알아서 수정)
        /App 가저가서 쓰길바람 
