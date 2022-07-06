# Project 'Hunter`s club'
## Language: TypeScript
## Framework: Express
## Linter: eslint
## ORM: Prisma

___
## Database Models
### UserModel

| NAME | TYPE | PROPETY |
|---------|:---------:|:------------:|
| id | Int | @id autoincrement |
| email | String | @unique |
| password | String | |
| name | String | |
| role | String | @default ('USER') |
| guns | GunModel [ ] | |

### GunModel

| NAME | TYPE | PROPETY |
|---------|:---------:|:------------:|
| id | Int | @id autoincrement |
| name | String | @unique |
| type | String | |
| magazine_size | Int | |
| weight | Float | @default ('USER') |
| caliber | Float | |
| user_id | Int | |
| user | UserModel | @relation( fields: [user_id], references: [id]) |

___
#### Description
This project is a *somehow* realisation of working web-application of hunter`s club. The place where may exist members of this club (users) with/without registered weapon.

The relations between models are next: *weapon* **must** have an *owner* and *owner* **may** have many *weapons*.

___
## Technology stack
### TypeScript
Is an open-source programming language that builds on top of JavaScript. Was taken because indeed helps in process of development by *adding types* to JS. TS makes code became more readeble and allow us to catching some errors before running code. Moreover the syntax is almost the same as in JS.