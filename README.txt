project 구조/
├── api/
│   ├── heritageImageApi.js        # Handles image data from external APIs.
│   ├── heritageInfoDetailApi.js   # Handles heritage info details.
├── db/
│   ├── pgClient.js                # PostgreSQL connection setup.
├── models/
│   ├── heritageImage.js           # HeritageImage data model.
│   ├── heritageVO.js              # HeritageVO data model.
├── routes/
│   ├── heritageRoutes.js          # RESTful endpoints for API interaction.
├── app.js                         # Main entry point for the server.
|
ㄴ────────────app(testial things) 
                # /fetcher = Openapi Importer (20)
                # /(main page) = PostgreSQL Importer (5)

