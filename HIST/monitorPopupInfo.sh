#!/bin/sh
# monitor.sh

ll=`ps -ef | grep doMakePopupInfo.sh | grep -v grep`

if [ -z "$ll" ]
then
    monitorFilesAndRestart doMakePopupInfo.sh index0.js index.html test.js monitorPopupInfo.sh popupInfo.js
else

    echo "monitor.sh already started ... request ignored"
fi

