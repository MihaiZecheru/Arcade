#ifndef SHARED_FUNCTIONS_FILE
#define SHARED_FUNCTIONS_FILE

#include <iostream>
#include <filesystem>

std::string get_database_filepath()
{
  return "../database/";
}

void assert_database_folder_exists(std::string database_filepath)
{
  if (!std::filesystem::exists(database_filepath))
  {
    std::filesystem::create_directory(database_filepath);
  }
}

#endif