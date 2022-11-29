# Indexter Backend

## Services / Modules
* account_linking
  * Responsible for establishing links to 3rd party accounts like Google Drive/Docs and Atlassian.
  * Manages `Credentials` the data type for tracking user access grants to 3p accounts
* auth
  * Responsible for creating magic links and emailing them to users
  * Validates magic links when user clicks on them to ensure only an authorize user gains a session cookie or auth token
  * Manages `MagicLinks` the data type for tracking pending authentication flows
* emailer
  * Support module for injecting smtp credentials to node-mailer
* import
  * Responsible for importing docs from 3p services to elasticsearch
  * Manages `Docs` the data type representing a document
* lib
  * Support stuff like JWT middleware and cross-cutting type definitions & interfaces (like repository)
* users
  * Responsible for managing `Users` (hopefully this is self explanatory)
* workstreams
  * Responsible for managing stages of long running flows 
  * Manages the `WorkStream` and `Steps` data types for describing the stage of a long running flow like importing docs

## Infra
### Setup / Get Started
Just run `docker-compose up`. Depends on `elasticsearch` and `postgres db` 
For env vars - see `.env-example` and fill in the blanks. You'll need access to 
* GMail API
* GDrive API
* GDocs API
* Atlassian API
* Slack API

### Migrations
To get your DB up to date with all the latest tables and schemas run `pg-migrator postgres://postgres:postgres@localhost/indexter`