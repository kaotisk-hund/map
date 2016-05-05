#!/bin/bash
nc h.magik6k.net 9001 -w 5 > data && node sendSnodeGraph.js
