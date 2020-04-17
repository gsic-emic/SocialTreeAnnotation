#!/bin/bash
kill -9 $(ps aux | grep "node app.js" | awk 'NR==1{print $2}')
