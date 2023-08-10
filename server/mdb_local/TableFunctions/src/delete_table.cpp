#include "shared.hpp"
#include <fstream>

void delete_table(std::string database_filepath, std::string table_name);
std::string get_table_name(void);
bool delete_another_table(void);

int main(int argc, char **argv)
{
  std::string database_filepath = get_database_filepath();
  assert_database_folder_exists(database_filepath);

  while (true)
  {
    std::string table_name = get_table_name();
    delete_table(database_filepath, table_name);
    if (!delete_another_table()) break;
  }
}

/**
 * @brief Get the name of the table to delete
*/
std::string get_table_name()
{
  std::string table_name;
  std::cout << "Name of table to delete: ";
  std::cin >> table_name;
  std::cout << std::endl;
  return table_name;
}

/**
 * @brief Erase a line from a file, used in the delete_table function
*/
void eraseFileLine(std::string path, int eraseLine)
{
  std::string line;
  std::ifstream fin;
  
  fin.open(path);
  // contents of path must be copied to a temp file then
  // renamed back to the path file
  std::ofstream temp;
  temp.open(path + ".tmp");

  int line_number = 0;
  while (getline(fin, line))
  {
    line_number++;
    // write all lines to temp other than the line marked for erasing
    if (line_number != eraseLine) temp << line << std::endl;
  }

  temp.close();
  fin.close();

  // Pipe error if attempting to delete ore rename table.info
  // So instead of that, the tmp file will be read and the contents will be written to table.info
  std::ifstream temp_file;
  temp_file.open(path + ".tmp");

  std::ofstream table_info;
  table_info.open(path);

  while (getline(temp_file, line))
  {
    table_info << line << std::endl;
  }

  temp_file.close();
  table_info.close();
  remove((path + ".tmp").c_str());
}

/**
 * @brief Delete table from database and from the table.info file
*/
void delete_table(std::string database_filepath, std::string table_name)
{
  std::string tables_info_file = database_filepath + "table.info";
  std::cout << "Deleting table \"" << table_name << "\" ..." << std::endl;
  
  std::ifstream tables_info(tables_info_file);
  std::string line;
  int line_number = 0;

  bool table_found = false;
  while (std::getline(tables_info, line))
  {
    line_number++;
    // Example of a line: {"name":"table1","folder":"./database/table1","fieldnames":["field1","field2"]}
    // 9 is the amount of characters until the table name
    std::string name_on_line = line.substr(9, line.find('"', 9) - 9);

    if (name_on_line == table_name)
    {
      table_found = true;
      break;
    }
  }

  eraseFileLine(tables_info_file, line_number);
  std::filesystem::remove_all(database_filepath + table_name);

  tables_info.close();
  std::cout << "Done\n" << std::endl;
}

/**
 * @brief Ask user if they want to delete another table
*/
bool delete_another_table()
{
  std::string answer;
  std::cout << "Delete another table? (y/n): ";
  std::cin >> answer;
  std::cout << std::endl;
  return answer == "y";
}
