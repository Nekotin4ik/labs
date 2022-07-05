Project
Language: TypeScript
Framework: Express
Linter: eslint

Database models:
    UserModel
id          Int     @id autoincrement
email       String  @unique
password    String
name        String
role        String  @default ('USER')
guns        GunModel[]

    GunModel
id              Int         @id autoincrement
name            String      @unique
type            String
magazine_size   Int
weight          Float
caliber         Float
user_id         Int
user            UserModel   @relation( fields: [user_id], references: [id])

