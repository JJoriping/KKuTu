#!/bin/zsh
export KKT_SV_NAME="RHKKuTu"
node ./Server/lib/Game/cluster.js 0 1 &
node ./Server/lib/Web/cluster.js 1 &
