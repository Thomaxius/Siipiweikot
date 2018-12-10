
import { SQLite } from 'expo';



const db = SQLite.openDatabase('siipiweikot.db');
const error = (tx, error, operation) => {console.log(`There was an error with '${operation}': ` + error)}

const schemas = {
    kaynnitSchema: `
                    CREATE TABLE visits 
                    (
                        visitid integer PRIMARY KEY NOT NULL,  
                        date date NOT NULL, 
                        arrive_time date NOT NULL,  
                        food_arrive_time date NOT NULL, 
                        meal text NOT NULL, 
                        other_info text, 
                        photo blob,
                        restaurantid integer,
                        FOREIGN KEY(restaurantid) REFERENCES restaurant(restaurantid)
                    )
                    `,
    ravintolatSchema: `
                    CREATE TABLE restaurants 
                    (
                        restaurantid int UNIQUE NOT NULL,  
                        fullname text NOT NULL, 
                        address text NOT NULL,  
                        city text NOT NULL
                    )`
}

const restaurants = {
    1: {
        name: "Siipiweikot Kaisaniemi, Helsinki",
        address: "Mikonkatu 17B",
        city: "Helsinki"
    },
    2: {
        name: "Original Siipiweikot Tampere",
        address: "Aleksanterinkatu 26",
        city: "Tampere"
    },
    3: {
        name: "Siipiweikot Iso-Omena, Espoo",
        address: "Piispansilta 11",
        city: "Espoo"
    },
    4: {
        name: "Siipiweikot Tikkurila",
        address: "Asematie 1",
        city: "Vantaa"
    }
}

const initialDb = async () => {
    console.log('here')
    // Luodaan taulut
    Object.keys(schemas).forEach((schemaName)=> {
        db.transaction(tx => {
        tx.executeSql(schemas[schemaName], null, console.log(`Schema ${schemaName} created`) , (tx, e) => error(tx, e, ("creating schema " + schemaName)))
    }) 
    })
    // Lisätään ravintolat
    Object.keys(restaurants).forEach((key) => 
        db.transaction(tx => {
        tx.executeSql('INSERT INTO restaurants (restaurantid, fullname, address, city)  VALUES (?, ?, ?, ?)', [key, restaurants[key].name, restaurants[key].address, restaurants[key].city], console.log(`Row ${restaurants[key].name}, ${restaurants[key].address}, ${restaurants[key].city} added`) , 
        (tx, e) => error(tx, e, (`adding row ${key}, ${restaurants[key].name}, ${restaurants[key].address}, ${restaurants[key].city}`)))
    }))   
}

const addVisit = async (date, arrive_time, food_arrive_time, meal, other_info, photo, restaurantid) => { // Pitää olla selekästi async, muuten createSchema(..) ajautuu ennen
        db.transaction(tx => {
            sql =
            'INSERT INTO visits (date, arrive_time, food_arrive_time, meal, other_info, photo, restaurantid) ' +
            ' VALUES (?, ?, ?, ?, ?, ?, ?)';
            tx.executeSql(
            sql,
            [
                date,
                arrive_time,
                food_arrive_time,
                meal,
                other_info,
                photo, 
                restaurantid
            ],
            console.log(`Row ${date}, ${arrive_time}, ${food_arrive_time}, ${meal}, ${other_info}, ${photo}, ${restaurantid} added succesfully.`),
            (tx, e) => error(tx, e, "addVisit")
            )
        })
    }
    
    const deleteVisit = async (rowid) => { // Pitää olla selekästi async, muuten createSchema(..) ajautuu ennen
        console.log(`DELETE FROM visits WHERE visitid = ${rowid}`, rowid)
        db.transaction(tx => {
            sql =
            `DELETE FROM visits WHERE visitid = ${rowid}`
            tx.executeSql(
            sql,
            null,
            console.log(`Deletion of row ${rowid} succesful.`),
            (tx, e) => error(tx, e, "deleteVisit")
            )
        })
    }

const getRestaurants = async (callbackfunc) => {
        db.transaction(tx => 
            {tx.executeSql(
                        `SELECT 
                            * 
                        FROM 
                            restaurants
                        `, 
            null, 
            callbackfunc, 
            (tx, e) => error(tx, e, "restaurants"));
        })
            
    }

const getVisits = async (callbackfunc) => {
    db.transaction(tx => 
        {tx.executeSql(
                    `SELECT 
                        * 
                    FROM 
                        visits
                    `, 
        null, 
        callbackfunc, 
        (tx, e) => error(tx, e, "getVisits"));
    })
        
}



  module.exports = {
    getVisits,
    initialDb,
    addVisit,
    getRestaurants,
    deleteVisit
  }
