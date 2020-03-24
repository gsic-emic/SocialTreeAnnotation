#!/bin/bash
kill $(ps aux | grep "/usr/bin/node app.js" | awk 'NR==1{print $2}')
