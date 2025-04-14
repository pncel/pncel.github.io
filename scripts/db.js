import { Database } from "./dist/database.js";
import { DatabaseMutator } from "./dist/databaseMutator.js";

const mutator = new DatabaseMutator(await Database.get());
mutator.persist().then(() => process.exit(0));
