#!/bin/bash
# Double-click to open Bhoomi Saral on this computer only (http://localhost:8080)
cd "$(dirname "$0")"
open "http://localhost:8080" &
python3 -m http.server 8080 --bind 127.0.0.1
