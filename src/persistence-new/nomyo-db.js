import Dexie from 'dexie';
import {NomyoIdGeneratorService} from "./nomyo-id-generator";

export class NomyoDb extends Dexie {

  constructor() {
    super("NomyoDB");
    this.idGenerator = NomyoIdGeneratorService;
    this.version(1).stores({
      users: "uId",
      workspaces: "id, name, authorId",
      notes: "id, range, ownerId, workspaceId",
      containers: "id, noteId, workspaceId, *content",
      paragraphs: "id",
      figures: "id, mediaId",
      images: "id, type",
      contents: "[noteId+position], position, noteId, contentId",
      annos: "id, [label+contextId], workspaceId, label, contextId",
      // sutokey: "[annotationId+noteId+annotationType], [annotationId+noteId], [annotationId+annotationType], [noteId+annotationType], annotationId, noteId, annotationType",
      subjects: "noteId, annotationId",
      scopes: "noteId, annotationId",
      topics: "[noteId+annotationId], noteId, annotationId",
      keywords: "[noteId+annotationId], noteId, annotationId",
      reltypes: "id, cardinality",
      relationships: "id, typeId, workspaceId, *sources, *targets",
      tags: "[tag+noteId], tag, noteId",
      asidehooks: "id, noteId",
      asidecontents: "[asideId+position], asideId, position, contentId"
    });

    this.users = this.table("users");
    this.workspaces = this.table("workspaces");
    this.notes = this.table("notes");
    this.containers = this.table("containers");
    this.paragraphs = this.table("paragraphs");
    this.figures = this.table("figures");
    this.images = this.table("images");
    this.contents = this.table("contents");
    this.annos = this.table("annos");
    // this.sutokey = this.table("sutokey");
    this.subjects = this.table("subjects");
    this.scopes = this.table("scopes");
    this.topics = this.table("topics");
    this.keywords = this.table("keywords");
    this.reltypes = this.table("reltypes");
    this.relationships = this.table("relationships");
    this.tags = this.table("tags");
    this.asidehooks = this.table("asidehooks");
    this.asidecontents = this.table("asidecontents");
    console.log("%cDatabase initialized", "color: green");
  }

  async clearAll() {
    await Promise.all([
      this.users.clear(),
      this.workspaces.clear(),
      this.notes.clear(),
      this.containers.clear(),
      this.paragraphs.clear(),
      this.figures.clear(),
      this.images.clear(),
      this.contents.clear(),
      this.annos.clear(),
      // this.sutokey.clear(),
      this.subjects.clear(),
      this.scopes.clear(),
      this.topics.clear(),
      this.keywords.clear(),
      this.reltypes.clear(),
      this.relationships.clear(),
      this.tags.clear(),
      this.asidehooks.clear(),
      this.asidecontents.clear()
    ]);
  }

  // schema of each tables
  static async listAllTables() {
    const db = new NomyoDb();
    await db.open();

    db.tables.forEach(function (table) {
      console.log("Schema of " + table.name + ": " + JSON.stringify(table.schema));
    });

  }

  // schema of a specified table
  static async listTables(tableName) {
    const db = new NomyoDb();
    await db.open();
    const table = db.table(tableName);
    if(!table) {
      console.log("Table not found");
      return;
    }
    console.log("Schema of " + table.name + ": " + JSON.stringify(table.schema));
  }
  
  // schema of list all data
  static async listAllData() {
    const db = new NomyoDb();
    await db.open();
  
    const users = await db.users.toArray();
    console.log("Users:");
    console.log(users);
  
    const workspaces = await db.workspaces.toArray();
    console.log("Workspaces:");
    console.log(workspaces);
  
    const notes = await db.notes.toArray();
    console.log("Notes:");
    console.log(notes);
  
    const containers = await db.notes.toArray();
    console.log("Containers:");
    console.log(containers);

    const paragraphs = await db.notes.toArray();
    console.log("Paragraphs:");
    console.log(paragraphs);

    const figures = await db.notes.toArray();
    console.log("Figures:");
    console.log(figures);

    const images = await db.images.toArray();
    console.log("Images:");
    console.log(images);

    const contents = await db.contents.toArray();
    console.log("Contents:");
    console.log(contents);

    const annos = await db.annos.toArray();
    console.log("Annos:");
    console.log(annos);

    const subjects = await db.subjects.toArray();
    console.log("Subjects:");
    console.log(subjects);

    const scopes = await db.scopes.toArray();
    console.log("Scopes:");
    console.log(scopes);

    const topics = await db.topics.toArray();
    console.log("Topics:");
    console.log(topics);

    const keywords = await db.keywords.toArray();
    console.log("Keywords:");
    console.log(keywords);

    const reltypes = await db.reltypes.toArray();
    console.log("Reltypes:");
    console.log(reltypes);

    const relationships = await db.relationships.toArray();
    console.log("Relationships:");
    console.log(relationships);

    const tags = await db.tags.toArray();
    console.log("Tags:");
    console.log(tags);

    const asidehooks = await db.asidehooks.toArray();
    console.log("AsideHooks:");
    console.log(asidehooks);

    const asidecontents = await db.asidecontents.toArray();
    console.log("AsideContents:");
    console.log(asidecontents);

  }
  
}

