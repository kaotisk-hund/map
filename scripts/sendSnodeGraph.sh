#!/bin/bash
nc snode.fc00.li 9001 -w 5 > data && node gen.js 

