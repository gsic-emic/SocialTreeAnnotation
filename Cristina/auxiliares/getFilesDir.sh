#!/bin/bash
dir="/home/ubuntu/SocialTreeAnnotation/Cristina/data"
declare -a my_array
index=0
for file in "$dir"/*
    do
        my_array[$index]=$file
        index=`expr $index + 1`
    done

printf "%s\n" "${my_array[@]}"