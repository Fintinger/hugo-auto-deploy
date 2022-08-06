#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

read -p"输入commit信息:" var
# echo ${var} >a.txt

hugo --buildDrafts
# 进入生成的文件夹
cd public
git add .

echo -e "\033[45;30m About to commit... \033[0m"
read -p"Press any key to continue..." var
git commit -m "${var}"

echo -e "\033[45;30m About to push... \033[0m"
read -p"Press any key to continue..." var
git push

read -p"Press any key to quit" var

cd -