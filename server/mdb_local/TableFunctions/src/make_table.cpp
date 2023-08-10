#include "shared.hpp"
#include <algorithm>
#include <fstream>
#include <vector>

std::vector<std::string> get_fields()
{
  std::cout << "Enter ':q' to quit or ':d' to finish adding fields" << std::endl;
  
  std::vector<std::string> fields;
  while (true)
  {
    std::string field_name;
    std::cout << "Enter field name: ";
    std::cin >> field_name;
    std::cout << std::endl;

    if (field_name == ":q") exit(0);
    if (field_name == ":d") break;

    // Check if field_name is not alphanumeric
    if (any_of(field_name.begin(), field_name.end(), [](const char& c) -> bool { return c != '_' && !isalnum(c); }))
    {
      std::cout << "Field name must be alphanumeric" << std::endl;
      continue;
    }
    
    fields.push_back(field_name);
  }

  return fields;
}

std::string get_table_name()
{
  std::string table_name;
  std::cout << "Name your table: ";
  std::cin >> table_name;
  std::cout << std::endl;

  // Check if table_name is not alphanumeric
  if (any_of(table_name.begin(), table_name.end(), [](const char& c) -> bool { return c != '_' && !isalnum(c); }))
  {
    std::cout << "Table name must be alphanumeric" << std::endl;
    exit(1);
  }

  return table_name;
}

std::string json_stringify(std::string name, std::string table_folder_path, std::vector<std::string> fieldnames)
{
  std::string formatted_fieldnames = "";
  for (int i = 0; i < fieldnames.size(); i++)
  {
    formatted_fieldnames += "\"" + fieldnames[i] + "\"";
    if (i != fieldnames.size() - 1)
    {
      formatted_fieldnames += ",";
    }
  }

  return "{\"name\":\"" + name + "\",\"folder\":\"" + table_folder_path + "\",\"fieldnames\":[" + formatted_fieldnames + "]}";
}

int main() {
  std::string database_filepath = get_database_filepath();
  std::string table_name = get_table_name();
  std::string table_path = database_filepath + table_name;
  assert_database_folder_exists(database_filepath);
  std::vector<std::string> fieldnames = get_fields();
  
  if (fieldnames.size() == 0)
  {
    std::cout << "Table must have at least one field" << std::endl;
    exit(1);
  }
  
  std::filesystem::create_directory(table_path);
  std::string tables_info_file = database_filepath + "table.info";
  std::ofstream f;
  
  if (std::filesystem::exists(tables_info_file))
    f.open(tables_info_file, std::ios::app);
  else
    f.open(tables_info_file, std::ios::out);
  
  // substr for removing one dir level; from '../database/' to './database/'
  f << json_stringify(table_name, table_path.substr(1), fieldnames) << std::endl;
  f.close();

  std::cout << "Table created successfully" << std::endl;
}