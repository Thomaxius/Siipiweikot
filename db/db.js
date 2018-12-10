import { SQLite } from 'expo'

  const virhe = (tx, error) => {
  console.log(error);
}

function createDb () {
    console.log("Here1")
  const db = SQLite.openDatabase('siipiweikot.db');
      db.transaction(tx => {
      let sql =
        'CREATE TABLE if not exists kaynnit (' +
        'id integer PRIMARY KEY NOT NULL, ' +
        'PVM date NOT NULL, ' +
        'aloitusaika datetime NOT NULL, ' +
        'lopetusaika datetime NOT NULL, ' +
        'meal text NOT NULL, ' +
        'otherinfo text)';
      tx.executeSql(sql, null, null, virhe);
      });
  console.log("Here")
}

module.exports = {
  db:createDb
}



