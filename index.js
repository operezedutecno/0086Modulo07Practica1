const { createServer } = require("http");
const url = require("url");
const { Pool } = require("pg");
const Cursor = require("pg-cursor");


const conPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'dvdrental',
    user: 'postgres',
    password: 'postgres'
});


createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    res.setHeader("Content-Type","application/json")

    if(method == "GET") {
        if(path == "/actores-peliculas") {
            const client = await conPool.connect();
            const result = await client.query(`
                    SELECT a.actor_id, a.first_name, a.last_name, f.title, f.release_year 
                    FROM actor a
                        INNER JOIN film_actor fa ON fa.actor_id = a.actor_id
                        INNER JOIN film f ON f.film_id = fa.film_id`
            );
            client.release();
            res.end(JSON.stringify({ message: "Actores con sus películas", data: result.rows }))
        }
        if(path == "/peliculas-categorias") {
            const result = await conPool.query(`
                SELECT f.title, f.release_year, c.name
                FROM film f
                    INNER JOIN film_category fc ON fc.film_id = f.film_id
                    INNER JOIN category c ON c.category_id = fc.category_id
                ORDER BY f.title`
            );
            res.end(JSON.stringify({ message: "Películas con sus categorías", data: result.rows }))
        }

        if(path == "/peliculas-idioma") {
            const client = await conPool.connect();
            const result = await client.query(
                new Cursor(`
                    SELECT a.actor_id, a.first_name, a.last_name, f.title, f.release_year 
                    FROM actor a
                        INNER JOIN film_actor fa ON fa.actor_id = a.actor_id
                        INNER JOIN film f ON f.film_id = fa.film_id`
                )
            );
            const res1 = await result.read(10);
            console.log("Grupo 1*************************************************");
            console.log(res1);
            const res2 = await result.read(5);
            console.log("Grupo 2*************************************************");
            console.log(res2);
            const res3 = await result.read(20);
            console.log("Grupo 3*************************************************");
            console.log(res3);

            res.end(JSON.stringify({ message: "Películas con su idioma" }))
        }

    }

}).listen(3000, () => console.log("Puerto 3000"))