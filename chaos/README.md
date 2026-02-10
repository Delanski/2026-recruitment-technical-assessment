> This question is relevant for **chaos backend**

# DevSoc Subcommittee Recruitment: Chaos Backend

***Complete as many questions as you can.***

## Question 1
You have been given a skeleton function `process_data` in the `data.rs` file.
Complete the parameters and body of the function so that given a JSON request of the form

```json
{
  "data": ["Hello", 1, 5, "World", "!"]
}
```

the handler returns the following JSON:
```json
{
  "string_len": 11,
  "int_sum": 6
}
```

Edit the `DataResponse` and `DataRequest` structs as you need.

## Question 2

### a)
Write SQL (Postgres) `CREATE` statements to create the following schema. Be sure to include foreign keys to appropriately model the relationships and, if appropriate, make relevant tables `CASCADE` upon deletion. You may enrich the tables with additional columns should you wish. To help you answer the question, a simple diagram is provided. 
![Database Schema](db_schema.png)

**Answer box:**
```sql
CREATE TABLE Users (
  id integer PRIMARY KEY
);

CREATE TABLE songs (
  id integer PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  duration interval NOT NULL
);

CREATE TABLE playlists (
  id integer PRIMARY KEY,
  user_id integer FOREIGN KEY REFERENCES User(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE playlist_songs (
  playlist_id integer FOREIGN KEY REFERENCES playlists(id) ON DELETE CASCADE,
  song_id integer FOREIGN KEY REFERENCES songs(id) ON DELETE CASCADE,
  PRIMARY KEY(playlist_id, song_id)
);
```

### b)
Using the above schema, write an SQL `SELECT` query to return all songs in a playlist in the following format, given the playlist id `676767`
```
| id  | playlist_id | title                                      | artist      | duration |
| --- | ----------- | ------------------------------------------ | ----------- | -------- |
| 4   | 676767      | Undone - The Sweater Song                  | Weezer      | 00:05:06 |
| 12  | 676767      | She Wants To Dance With Me - 2023 Remaster | Rick Astley | 00:03:18 |
| 53  | 676767      | Music                                      | underscores | 00:03:27 |
```

**Answer box:**
```sql
SELECT
  s.id,
  p.playlist_id,
  s.title,
  s.artist,
  s.duration
FROM playlist_songs p
JOIN songs s
  ON p.song_id = s.id
WHERE p.playlist_id = 676767
```
