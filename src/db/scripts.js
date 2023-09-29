import { NomyoDb } from '../persistence-new/nomyo-db';
import List from '../info/list';

function Scripts() {

  main();

  return (
    <>

    <List/>
      <br/>
      <br/>
    
    </>
  );
}

async function main() {

  const db = new NomyoDb();
  await db.open();
  /*await NomyoDb.listAllTables();*/
  console.log("%cok all data has been displayed correctly on the console", "color: green");
  /*await NomyoDb.listAllData();*/
  
}

export default Scripts;
