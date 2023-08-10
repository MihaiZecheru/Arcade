const fs = require('fs');

/**
 * Example of a database-entry record. Note the TEntry type is a Record<fieldname, fieldvalue>
 */
const __record__: TEntry = {
  hello: "world",
  lorem: "ipsum"
};

/**
 * The name of a field in an entry/table
 */
export type fieldname = string;

/**
 * The value of a field in an entry/table - a string that may represent numbers, booleans, etc.
 * The value is parsed when using a function from the Table class, which will call the user-defined parseFunction to parse the field values
 */
export type fieldvalue = string;

/**
 * The id of a table entry
 */
export type entryid = number;

/**
 * Table entry type
 */
export type TEntry = Record<fieldname, fieldvalue>;

/**
 * Custom filter function type for applying to table entries using the Table.get_with_filter() method
 */
export type TEntriesFilter = (entry: TEntry) => boolean;

/**
 * Custom function for parsing table entries, as all fields are by default unparsed strings and might need to be converted to numbers, booleans, dates, a class instance, etc.
 * This function can also be used to convert a TEntry record (which is a Record<fieldname, fieldvalue>) to a custom type (e.g. a class instance)
 * This custom type returned is indicated by the generic type T
 * 
 * @example
 * class User {
 *  public readonly name: string;
 *  public readonly password: string;
 * }
 * 
 * const parseFunction: TParseEntryFieldsFunction = (entry: TEntry): User => {
 *  return new User(entry.name, entry.password);
 * }
 */
export type TParseEntryFieldsFunction = (entry: TEntry) => any;

/**
 * Raw JSON table type
 */
type TRawTable = {
  readonly name: string;
  readonly folder: string;
  readonly fieldnames: Array<fieldname>;
}

/**
 * Database Table
 */
export class Table {
  /**
   * The separator used to separate fields in an entry
   */
  static ENTRY_SEP: string = "{<@SEP>}"; 
  
  /**
   * The name of the table
   */
  public readonly name: string;

  /**
   * The path to the folder where the table's entries are stored
   */
  private readonly folder: string;

  /**
   * The names of the fields in the table / in the table's entries
   */
  private readonly fieldnames: Array<fieldname>;

  /**
   * Function for parsing table entries, as all fields are by default unparsed strings and might need to be converted to numbers, booleans, dates, a class instance, etc.
   */
  private parseFunction: TParseEntryFieldsFunction;

  /**
   * Create a table from a raw json table stored in the table.info file
   * @important This constructor is not meant to be used directly, all tables are instantiated when the Database.connect() method is called
   * @param raw_table The raw json table from the table.info file
   */
  constructor(raw_table: TRawTable) {
    this.name = raw_table.name;
    this.folder = `./database/${raw_table.name}/`;
    this.fieldnames = raw_table.fieldnames;
    // by default, the parseFunction will return the entry without parsing it
    this.parseFunction = (entry: TEntry): TEntry => entry;
  }

  /**
   * Change the parse function used to parse table entries
   * @param parseFunction The function to use for parsing table entries, as all fields are by default unparsed strings and might need to be converted to numbers, booleans, dates, a class instance, etc.
   * @note This will only affect the table object, not the table in the Database's memory. To update the table in the Database's memory, use the Database.set_parse_function() method
   */
  public set_parse_function(parseFunction: TParseEntryFieldsFunction): void {
    this.parseFunction = parseFunction;
  }

  /**
   * Get the filepath of the entry with the given id
   * @param id The id of the entry to get the filepath of
   * @returns The filepath of the entry with the given id
   */
  public entry_path(id: entryid): string {
    return this.folder + id;
  }

  /**
   * Get the next available id
   * @returns The next available id
   */
  private get_next_id(): entryid {
    const ids = fs.readdirSync(this.folder);
    if (!ids.length) return 1;
    return Math.max(...ids) + 1;
  }

  /**
   * Get all existing entry ids
   * @returns Every existing entryid
   */
  private get_all_ids(): Array<entryid> {
    return fs.readdirSync(this.folder).map((id: string) => parseInt(id));
  }

  /**
   * Write entry data to file
   * @param id The id of the entry to write to file
   * @param data The data to write to file
   * @throws Error if a field is missing in data or if there are too many fields in data
   */
  private write_to_file(id: entryid, data: TEntry): void {
    data['id'] = id.toString();
    
    let stringified_data = "";
    for (const fieldname of this.fieldnames) {
      const value = data[fieldname];
      if (!value) throw new Error(`Field '${fieldname}' is missing in data`);
      stringified_data += `${Table.ENTRY_SEP}${value}${Table.ENTRY_SEP}\n`;
    }

    if (Object.keys(data).length - 1 > this.fieldnames.length) throw new Error(`Too many fields in data`);
    fs.writeFileSync(this.entry_path(id), stringified_data.substring(0, stringified_data.length - 1), { encoding: 'utf8', flag: 'w' });
  }

  /**
   * Get an entry
   * @param id The id of the entry to get
   * @returns The entry with the given id if it exists, otherwise null
   */
  public get(id: entryid): TEntry | null {
    if (!fs.existsSync(this.entry_path(id))) return null;

    const raw_entry = fs.readFileSync(this.entry_path(id), { encoding: 'utf8', flag: 'r' });
    const entries = raw_entry.match(new RegExp(`${Table.ENTRY_SEP}(.*?)${Table.ENTRY_SEP}`, 'g')).map((match: string) => match.substring(Table.ENTRY_SEP.length, match.length - Table.ENTRY_SEP.length));
    
    let record: TEntry = {};
    for (let i = 0; i < this.fieldnames.length; i++) {
      record[this.fieldnames[i]] = entries[i];
    }

    return record ? this.parseFunction(record) : null;
  }

  /**
   * Create a new entry
   * @param data The entry's data
   * @returns The created entry
   */
  public post(data: TEntry): TEntry {
    const id = this.get_next_id();
    this.write_to_file(id, data);
    return this.parseFunction(data);
  }
  
  /**
   * Update an entry
   * @param id The id of the entry to update
   * @param updated_fields Record containing the fields to update
   * @returns The updated entry
   * @throws Error if the entry does not exist
   */
  public patch(id: entryid, updated_fields: TEntry): TEntry {
    const current_data = this.get(id);
    const updated_data = { ...current_data, ...updated_fields };
    if (!fs.existsSync(this.entry_path(id))) throw new Error(`Entry with id '${id}' does not exist`);
    this.write_to_file(id, updated_data);
    return this.parseFunction(updated_data);
  }

  /**
   * Delete an entry
   * @param id The id of the entry to delete
   * @throws Error if the entry does not exist
   */
  public delete(id: entryid): TEntry {
    const entry: TEntry = this.get(id)!;
    if (!entry) throw new Error(`Entry with id '${id}' does not exist`);
    fs.unlinkSync(this.entry_path(id));
    return this.parseFunction(entry);
  }

  // *** FILTER-QUERY GET METHODS *** ///

  /**
   * Get all entries in the table
   * @returns Every entry in the table
   */
  public get_all(): Array<TEntry> {
    return fs.readdirSync(this.folder).map((id: string) => this.parseFunction(this.get(parseInt(id))!));
  }

  /**
   * Get all entries that pass the given filter
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param filter The filter to apply to each of the entries
   * @returns All entries that pass the given filter
   */
  public get_with_filter(filter: TEntriesFilter): Array<TEntry> {
    return this.get_all().filter(filter);
  }

  /**
   * Get all entries where the field with the given name is equal to the given value
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries where the field with the given name is equal to the given value
   */
  public get_where(fieldname: fieldname, value: string): Array<TEntry> {
    return this.get_all().filter((entry: TEntry) => entry[fieldname] === value);
  }

  /**
   * Get all entries where the field with the given name is not equal to the given value
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries where the field with the given name is not equal to the given value
   */
  public get_where_not(fieldname: fieldname, value: string): Array<TEntry> {
    return this.get_all().filter((entry: TEntry) => entry[fieldname] !== value);
  }

  /**
   * Get all entries where the field with the given name is greater than the given value
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries where the field with the given name is greater than the given value
   */
  public get_where_gt(fieldname: fieldname, value: string): Array<TEntry> {
    return this.get_all().filter((entry: TEntry) => entry[fieldname] > value);
  }

  /**
   * Get all entries where the field with the given name is less than the given value
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries where the field with the given name is less than the given value
   */
  public get_where_lt(fieldname: fieldname, value: string): Array<TEntry> {
    return this.get_all().filter((entry: TEntry) => entry[fieldname] < value);
  }

  /**
   * Get all entries where the field with the given name is greater than or equal to the given value
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries where the field with the given name is greater than or equal to the given value
   */
  public get_where_gte(fieldname: fieldname, value: string): Array<TEntry> {
    return this.get_all().filter((entry: TEntry) => entry[fieldname] >= value);
  }

  /**
   * Get all entries where the field with the given name is less than or equal to the given value
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries where the field with the given name is less than or equal to the given value
   */
  public get_where_lte(fieldname: fieldname, value: string): Array<TEntry> {
    return this.get_all().filter((entry: TEntry) => entry[fieldname] <= value);
  }

  /**
   * Get all entries where the field with the given name contains the given value
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries where the field with the given name contains the given value
   */
  public get_where_contains(fieldname: fieldname, value: string): Array<TEntry> {
    return this.get_all().filter((entry: TEntry) => entry[fieldname].includes(value));
  }

  /**
   * Get all entries where the field with the given name does not contain the given value
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries where the field with the given name does not contain the given value
   */
  public get_where_not_contains(fieldname: fieldname, value: string): Array<TEntry> {
    return this.get_all().filter((entry: TEntry) => !entry[fieldname].includes(value));
  }

  /**
   * Get all entries where the field with the given name starts with the given value
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries where the field with the given name starts with the given value
   */
  public get_where_starts_with(fieldname: fieldname, value: string): Array<TEntry> {
    return this.get_all().filter((entry: TEntry) => entry[fieldname].startsWith(value));
  }

  /**
   * Get all entries where the field with the given name ends with the given value
   * @important The filter is applied after the parseFunction has been applied to each of the entries 
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries where the field with the given name ends with the given value
   */
  public get_where_ends_with(fieldname: fieldname, value: string): Array<TEntry> {
    return this.get_all().filter((entry: TEntry) => entry[fieldname].endsWith(value));
  }

  // *** FILTER-QUERY PATCH METHODS *** ///

  /**
   * Update all entries in the table with the values in updated_fields
   * @param updated_fields The fields to update
   * @warning be careful using this method
   */
  public patch_all(updated_fields: TEntry): void {
    this.get_all_ids().map((id: entryid) => this.patch(id, updated_fields));
  }

  /**
   * Update all entries that pass the given filter
   * @param filter The filter to apply to each of the entries
   */
  public patch_with_filter(filter: TEntriesFilter, updated_fields: TEntry): void {
    const entries_with_ids: Array<TEntry> = this.get_all().map((entry: TEntry, index: number) => {
      entry['id'] = index.toString();
      return entry;
    });
    entries_with_ids.filter(filter).map((entry: TEntry) => this.patch(parseInt(entry.id), updated_fields));
  }

  /**
   * Update all entries in the table with the values in updated_fields where the field with the given name is equal to the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   */
  public patch_where(fieldname: fieldname, value: string, updated_fields: TEntry): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] === value) this.patch(id, updated_fields);
    });
  }

  /**
   * Get all entries where the field with the given name is not equal to the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   */
  public patch_where_not(fieldname: fieldname, value: string, updated_fields: TEntry): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] !== value) this.patch(id, updated_fields);
    });
  }

  /**
   * Get all entries where the field with the given name is greater than the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   */
  public patch_where_gt(fieldname: fieldname, value: string, updated_fields: TEntry): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] > value) this.patch(id, updated_fields);
    });
  }

  /**
   * Get all entries where the field with the given name is less than the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   */
  public patch_where_lt(fieldname: fieldname, value: string, updated_fields: TEntry): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] < value) this.patch(id, updated_fields);
    });
  }

  /**
   * Get all entries where the field with the given name is greater than or equal to the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   */
  public patch_where_gte(fieldname: fieldname, value: string, updated_fields: TEntry): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] >= value) this.patch(id, updated_fields);
    });
  }

  /**
   * Get all entries where the field with the given name is less than or equal to the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   */
  public patch_where_lte(fieldname: fieldname, value: string, updated_fields: TEntry): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] <= value) this.patch(id, updated_fields);
    });
  }

  /**
   * Get all entries where the field with the given name contains the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   */
  public patch_where_contains(fieldname: fieldname, value: string, updated_fields: TEntry): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname].includes(value)) this.patch(id, updated_fields);
    }); 
  }

  /**
   * Get all entries where the field with the given name does not contain the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   */
  public patch_where_not_contains(fieldname: fieldname, value: string, updated_fields: TEntry): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (!this.get(id)![fieldname].includes(value)) this.patch(id, updated_fields);
    });
  }

  /**
   * Get all entries where the field with the given name starts with the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   */
  public patch_where_starts_with(fieldname: fieldname, value: string, updated_fields: TEntry): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname].startsWith(value)) this.patch(id, updated_fields);
    });
  }

  /**
   * Get all entries where the field with the given name ends with the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   */
  public patch_where_ends_with(fieldname: fieldname, value: string, updated_fields: TEntry): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname].endsWith(value)) this.patch(id, updated_fields);
    });
  }

  // *** FILTER-QUERY DELETE METHODS *** ///

  /**
   * Delete all entries
   * @warning be careful using this method
   */
  public delete_all(): void {
    this.get_all_ids().forEach((id: entryid) => this.delete(id));
  }

  /**
   * Delete all entries that pass the given filter
   * @param filter The filter to apply to each of the entries
   */
  public delete_with_filter(filter: TEntriesFilter): void {
    const entries_with_ids: Array<TEntry> = this.get_all().map((entry: TEntry, index: number) => {
      entry['id'] = index.toString();
      return entry;
    });
    entries_with_ids.filter(filter).map((entry: TEntry) => this.delete(parseInt(entry.id)));
  }

  /**
   * Delete all entries where the field with the given name is equal to the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   */
  public delete_where(fieldname: fieldname, value: string): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] === value) this.delete(id);
    }); 
  }

  /**
   * Delete all entries where the field with the given name is not equal to the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   */
  public delete_where_not(fieldname: fieldname, value: string): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] !== value) this.delete(id);
    });
  }

  /**
   * Delete all entries where the field with the given name is greater than the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   */
  public delete_where_gt(fieldname: fieldname, value: string): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] > value) this.delete(id);
    });
  }

  /**
   * Delete all entries where the field with the given name is less than the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   */
  public delete_where_lt(fieldname: fieldname, value: string): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] < value) this.delete(id);
    });
  }

  /**
   * Delete all entries where the field with the given name is greater than or equal to the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   */
  public delete_where_gte(fieldname: fieldname, value: string): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] >= value) this.delete(id);
    });
  }

  /**
   * Delete all entries where the field with the given name is less than or equal to the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   */
  public delete_where_lte(fieldname: fieldname, value: string): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname] <= value) this.delete(id);
    });
  }

  /**
   * Delete all entries where the field with the given name contains the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   */
  public delete_where_contains(fieldname: fieldname, value: string): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname].includes(value)) this.delete(id);
    });
  }

  /**
   * Delete all entries where the field with the given name does not contain the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   */
  public delete_where_not_contains(fieldname: fieldname, value: string): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (!this.get(id)![fieldname].includes(value)) this.delete(id);
    });
  }

  /**
   * Delete all entries where the field with the given name starts with the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   */
  public delete_where_starts_with(fieldname: fieldname, value: string): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname].startsWith(value)) this.delete(id);
    });
  }

  /**
   * Delete all entries where the field with the given name ends with the given value
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   */
  public delete_where_ends_with(fieldname: fieldname, value: string): void {
    this.get_all_ids().forEach((id: entryid) => {
      if (this.get(id)![fieldname].endsWith(value)) this.delete(id);
    });
  }
}

/**
 * Static Database class for interacting with the MDBL database
 */
export default class Database {
  /**
   * The path to the database root folder
   */
  private static readonly database_folder: string = "./database/";
  
  /**
   * The path to the table.info file
   */
  private static readonly tables_info_file: string = this.database_folder + "table.info";
  
  /**
   * The tables in the database
   */
  private static tables: Array<Table> = [];

  /**
   * Connected status
   */
  private static connected: boolean = false;

  /**
   * @note This method is required before calling any other methods
   * Connect to the database,
   * create the neccessary files if they do not exist, 
   * and create existing tables from the table information in the file
   * @throws Error if the database is already connected
   */
  public static connect(): void {
    if (this.connected) throw new Error("Database already connected");
    
    if (!fs.existsSync(this.database_folder)) {
      fs.mkdir(this.database_folder);
    }

    if (fs.existsSync(this.tables_info_file)) {
      this.tables = fs.readFileSync(this.tables_info_file, { encoding: 'utf8', flag: 'r' }).split("\r\n").filter((line: string) => line.length != 0).map((line: string) => new Table(JSON.parse(line)));
    }

    this.connected = true;
  }

  /**
   * Get an existing table from the database
   * @param tablename The name of the table to get
   * @returns The table with the given tablename
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_table(tablename: string): Table {
    if (!this.connected) throw new Error("Database not connected - use 'Database.connect()' to connect to the database");
    const table = this.tables.find((table: Table) => table.name == tablename);
    if (!table) throw new Error(`Table ${tablename} does not exist`);
    return table;
  }

  /**
   * Set the parse function for the table with the given tablename
   * @param tablename The name of the table to set the parse function for
   * @param parseFunction The function to use to parse the entry fields
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static set_table_parse_function(tablename: string, parseFunction: TParseEntryFieldsFunction): void {
    for (let i = 0; i < this.tables.length; i++) {
      if (this.tables[i].name != tablename) continue;
      return this.tables[i].set_parse_function(parseFunction);
    }
  }

  /**
   * Get an entry with the given id from the table with the given tablename
   * @param tablename The name of the table to get the entry from
   * @param id The id of the entry to get
   * @returns The entry with the given id if it exists, otherwise null
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get(tablename: string, id: entryid): TEntry | null {
    const table = this.get_table(tablename);
    return table.get(id);
  }

  /**
   * Create a new entry in the table with the given tablename
   * @param tablename The name of the table to create the entry in
   * @param data The entry data
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static post(tablename: string, data: TEntry): void {
    const table = this.get_table(tablename);
    table.post(data);
  }

  /**
   * Update the entry with the given id in the table with the given tablename
   * @param tablename The name of the table to update the entry in
   * @param id The id of the entry to update
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch(tablename: string, id: entryid, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch(id, updated_fields);
  }

  /**
   * Delete the entry with the given id from the table with the given tablename
   * @param tablename The name of the table to delete the entry from
   * @param id The id of the entry to delete
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete(tablename: string, id: entryid): void {
    const table = this.get_table(tablename);
    table.delete(id);
  }

  /// *** FILTER-QUERY GET METHODS *** ///

  /**
   * Get all entries from the table with the given tablename
   * @param tablename The name of the table to get the entry from
   * @returns All entries from the table with the given tablename
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_all(tablename: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_all();
  }

  /**
   * Get all entries from the table with the given tablename that pass the given filter
   * @param tablename The name of the table to get the entry from 
   * @param filter The filter to apply to the entries
   * @returns The entries that pass the given filter
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_with_filter(tablename: string, filter: TEntriesFilter): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_with_filter(filter);
  }

  /**
   * Get all entries from the table with the given tablename where the field with the given name equals the given value
   * @param tablename The name of the table to get the entry from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries from the table with the given tablename where the field with the given name equals the given value
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_where(tablename: string, fieldname: fieldname, value: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_where(fieldname, value);
  }
  
  /**
   * Get all entries from the table with the given tablename where the field with the given name does not equal the given value
   * @param tablename The name of the table to get the entry from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries from the table with the given tablename where the field with the given name does not equal the given value
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_where_not(tablename: string, fieldname: fieldname, value: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_where_not(fieldname, value);
  }

  /**
   * Get all entries from the table with the given tablename where the field with the given name is greater than the given value
   * @param tablename The name of the table to get the entry from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries from the table with the given tablename where the field with the given name is greater than the given value
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_where_gt(tablename: string, fieldname: fieldname, value: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_where_gt(fieldname, value);
  }

  /**
   * Get all entries from the table with the given tablename where the field with the given name is less than the given value
   * @param tablename The name of the table to get the entry from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries from the table with the given tablename where the field with the given name is less than the given value
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_where_lt(tablename: string, fieldname: fieldname, value: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_where_lt(fieldname, value);
  }

  /**
   * Get all entries from the table with the given tablename where the field with the given name is greater than or equal to the given value
   * @param tablename The name of the table to get the entry from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries from the table with the given tablename where the field with the given name is greater than or equal to the given value
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_where_gte(tablename: string, fieldname: fieldname, value: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_where_gte(fieldname, value);
  }

  /**
   * Get all entries from the table with the given tablename where the field with the given name is less than or equal to the given value
   * @param tablename The name of the table to get the entry from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries from the table with the given tablename where the field with the given name is less than or equal to the given value
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_where_lte(tablename: string, fieldname: fieldname, value: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_where_lte(fieldname, value);
  }

  /**
   * Get all entries from the table with the given tablename where the field with the given name contains the given value
   * @param tablename The name of the table to get the entry from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries from the table with the given tablename where the field with the given name contains the given value
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_where_contains(tablename: string, fieldname: fieldname, value: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_where_contains(fieldname, value);
  }

  /**
   * Get all entries from the table with the given tablename where the field with the given name does not contain the given value
   * @param tablename The name of the table to get the entry from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries from the table with the given tablename where the field with the given name does not contain the given value
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_where_not_contains(tablename: string, fieldname: fieldname, value: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_where_not_contains(fieldname, value);
  }

  /**
   * Get all entries from the table with the given tablename where the field with the given name starts with the given value
   * @param tablename The name of the table to get the entry from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries from the table with the given tablename where the field with the given name starts with the given value
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_where_starts_with(tablename: string, fieldname: fieldname, value: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_where_starts_with(fieldname, value);
  }

  /**
   * Get all entries from the table with the given tablename where the field with the given name ends with the given value
   * @param tablename The name of the table to get the entry from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @returns All entries from the table with the given tablename where the field with the given name ends with the given value
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static get_where_ends_with(tablename: string, fieldname: fieldname, value: string): Array<TEntry> {
    const table = this.get_table(tablename);
    return table.get_where_ends_with(fieldname, value);
  }

  /// *** FILTER-QUERY PATCH METHODS *** ///

  /**
   * Update all entries from the table with the given tablename
   * @param tablename The name of the table to update the entries in
   * @param updated_fields The fields to update
   * @warning be careful using this method
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_all(tablename: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_all(updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename that pass the filter
   * @param tablename The name of the table to update the entries in
   * @param filter The filter to apply to the entries
   * @param updated_fields The updated fields to apply to the entries
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_with_filter(tablename: string, filter: TEntriesFilter, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_with_filter(filter, updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename where the field with the given name is equal to the given value
   * @param tablename The name of the table to update the entries in
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_where(tablename: string, fieldname: fieldname, value: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_where(fieldname, value, updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename where the field with the given name is not equal to the given value
   * @param tablename The name of the table to update the entries in
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_where_not(tablename: string, fieldname: fieldname, value: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_where_not(fieldname, value, updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename where the field with the given name is greater than the given value
   * @param tablename The name of the table to update the entries in
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_where_gt(tablename: string, fieldname: fieldname, value: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_where_gt(fieldname, value, updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename where the field with the given name is less than the given value
   * @param tablename The name of the table to update the entries in
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_where_lt(tablename: string, fieldname: fieldname, value: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_where_lt(fieldname, value, updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename where the field with the given name is greater than or equal to the given value
   * @param tablename The name of the table to update the entries in
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_where_gte(tablename: string, fieldname: fieldname, value: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_where_gte(fieldname, value, updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename where the field with the given name is less than or equal to the given value
   * @param tablename The name of the table to update the entries in
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_where_lte(tablename: string, fieldname: fieldname, value: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_where_lte(fieldname, value, updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename where the field with the given name contains the given value
   * @param tablename The name of the table to update the entries in
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_where_contains(tablename: string, fieldname: fieldname, value: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_where_contains(fieldname, value, updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename where the field with the given name does not contain the given value
   * @param tablename The name of the table to update the entries in
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_where_not_contains(tablename: string, fieldname: fieldname, value: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_where_not_contains(fieldname, value, updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename where the field with the given name starts with the given value
   * @param tablename The name of the table to update the entries in
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_where_starts_with(tablename: string, fieldname: fieldname, value: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_where_starts_with(fieldname, value, updated_fields);
  }

  /**
   * Update all entries from the table with the given tablename where the field with the given name ends with the given value
   * @param tablename The name of the table to update the entries in
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @param updated_fields The fields to update
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static patch_where_ends_with(tablename: string, fieldname: fieldname, value: string, updated_fields: TEntry): void {
    const table = this.get_table(tablename);
    table.patch_where_ends_with(fieldname, value, updated_fields);
  }

  /// *** FILTER-QUERY DELETE METHODS *** ///

  /**
   * Delete all entries from the table with the given tablename
   * @param tablename The name of the table to delete the entries from
   * @warning be careful using this method 
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_all(tablename: string): void {
    const table = this.get_table(tablename);
    table.delete_all();
  }

  /**
   * Delete all entries from the table with the given tablename that pass the given filter
   * @param tablename The name of the table to delete the entries from
   * @param filter The filter to apply to the table
   */
  public static delete_with_filter(tablename: string, filter: TEntriesFilter): void {
    const table = this.get_table(tablename);
    table.delete_with_filter(filter);
  }

  /**
   * Delete all entries from the table with the given tablename where the field with the given name is equal to the given value
   * @param tablename The name of the table to delete the entries from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_where(tablename: string, fieldname: fieldname, value: string): void {
    const table = this.get_table(tablename);
    table.delete_where(fieldname, value);
  }

  /**
   * Delete all entries from the table with the given tablename where the field with the given name is not equal to the given value
   * @param tablename The name of the table to delete the entries from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_where_not(tablename: string, fieldname: fieldname, value: string): void {
    const table = this.get_table(tablename);
    table.delete_where_not(fieldname, value);
  }

  /**
   * Delete all entries from the table with the given tablename where the field with the given name is greater than the given value
   * @param tablename The name of the table to delete the entries from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_where_gt(tablename: string, fieldname: fieldname, value: string): void {
    const table = this.get_table(tablename);
    table.delete_where_gt(fieldname, value);
  }

  /**
   * Delete all entries from the table with the given tablename where the field with the given name is greater than or equal to the given value
   * @param tablename The name of the table to delete the entries from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_where_gte(tablename: string, fieldname: fieldname, value: string): void {
    const table = this.get_table(tablename);
    table.delete_where_gte(fieldname, value);
  }

  /**
   * Delete all entries from the table with the given tablename where the field with the given name is less than the given value
   * @param tablename The name of the table to delete the entries from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_where_lt(tablename: string, fieldname: fieldname, value: string): void {
    const table = this.get_table(tablename);
    table.delete_where_lt(fieldname, value);
  }

  /**
   * Delete all entries from the table with the given tablename where the field with the given name is less than or equal to the given value
   * @param tablename The name of the table to delete the entries from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_where_lte(tablename: string, fieldname: fieldname, value: string): void {
    const table = this.get_table(tablename);
    table.delete_where_lte(fieldname, value);
  }

  /**
   * Delete all entries from the table with the given tablename where the field with the given name contains the given value
   * @param tablename The name of the table to delete the entries from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_where_contains(tablename: string, fieldname: fieldname, value: string): void {
    const table = this.get_table(tablename);
    table.delete_where_contains(fieldname, value);
  }

  /**
   * Delete all entries from the table with the given tablename where the field with the given name does not contain the given value
   * @param tablename The name of the table to delete the entries from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_where_not_contains(tablename: string, fieldname: fieldname, value: string): void {
    const table = this.get_table(tablename);
    table.delete_where_not_contains(fieldname, value);
  }

  /**
   * Delete all entries from the table with the given tablename where the field with the given name starts with the given value
   * @param tablename The name of the table to delete the entries from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_where_starts_with(tablename: string, fieldname: fieldname, value: string): void {
    const table = this.get_table(tablename);
    table.delete_where_starts_with(fieldname, value);
  }

  /**
   * Delete all entries from the table with the given tablename where the field with the given name ends with the given value
   * @param tablename The name of the table to delete the entries from
   * @param fieldname The name of the field to compare the given value with
   * @param value The value to compare the given field with
   * @throws Error if the table does not exist
   * @throws Error if the database is not connected
   */
  public static delete_where_ends_with(tablename: string, fieldname: fieldname, value: string): void {
    const table = this.get_table(tablename);
    table.delete_where_ends_with(fieldname, value);
  }
}
